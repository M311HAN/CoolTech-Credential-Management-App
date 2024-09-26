const OrganisationalUnitModel = require("../models/organisationalUnit");
const NewCredentialRepo = require("../models/credentials");
const jwt = require("jsonwebtoken");

// Fetch all Organizational Units (OUs) and filter based on user's access
exports.getOUs = async function (req, res) {
  const decoded = req.user;
  try {
    const orgUnits = await OrganisationalUnitModel.find();
    let orgUnitsArray = [];

    orgUnits.forEach((orgUnit) => {
      let singleOU = { ouName: orgUnit.ouName, divisions: [], ouUsers: [] };

      // Check if the user has access to this OU or any of its divisions
      const isUserAssignedToOU = orgUnit.ouUsers.includes(decoded.username);
      const isUserAdmin = decoded.role === "admin";

      // Filter divisions the user has access to
      orgUnit.divisions.forEach((division) => {
        const isUserAssignedToDivision = division.divisionUsers.includes(
          decoded.username
        );

        // Add the OU if the user has access to any divisions or is an admin
        if (isUserAssignedToDivision || isUserAdmin) {
          let singleDivision = {
            divisionName: division.divisionName,
            credentialRepos: [],
            divisionUsers: [],
          };
          division.credentialRepos.forEach((repo) => {
            singleDivision.credentialRepos.push(repo);
          });

          // If the user is an admin, include division users
          if (isUserAdmin) {
            singleDivision.divisionUsers = division.divisionUsers;
          }

          singleOU.divisions.push(singleDivision);
        }
      });

      // Add the OU if the user has access to any divisions or is an admin
      if (isUserAssignedToOU || singleOU.divisions.length > 0 || isUserAdmin) {
        if (isUserAdmin) {
          singleOU.ouUsers = orgUnit.ouUsers;
        }
        orgUnitsArray.push(singleOU);
      }
    });

    // Return filtered OUs based on user's role and access level
    return res.send({
      message: "Access to OUs successful.",
      username: decoded.username,
      role: decoded.role,
      orgUnits: orgUnitsArray,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Error accessing OUs.", error: err });
  }
};

// Add a new credential repository to a division within an OU
exports.addCredentialRepo = async function (req, res) {
  const decoded = req.user;
  if (!decoded) {
    return res.status(403).send({ message: "No token provided!" });
  }

  const {
    inputOuName,
    inputDivisionName,
    inputRepoName,
    inputRepoUsername,
    inputRepoEmail,
    inputRepoPassword,
  } = req.body;

  try {
    let fetchedOrgUnit = await OrganisationalUnitModel.findOne({
      ouName: inputOuName,
    });
    if (!fetchedOrgUnit)
      return res.status(404).send({ message: "OU not found" });

    // Check if user has permission to add repos (admin, management, or normal role)
    if (["admin", "management", "normal"].includes(decoded.role)) {
      let divisionIndex = fetchedOrgUnit.divisions.findIndex(
        (div) => div.divisionName === inputDivisionName
      );
      if (divisionIndex === -1)
        return res.status(404).send({ message: "Division not found" });

      // Ensure the repo does not already exist
      let repoExists = fetchedOrgUnit.divisions[
        divisionIndex
      ].credentialRepos.some((repo) => repo.repoName === inputRepoName);
      if (repoExists)
        return res.status(400).send({ message: "Repo name already exists." });

      // Create and add the new credential repo
      let newRepo = new NewCredentialRepo({
        repoName: inputRepoName,
        repoUsername: inputRepoUsername,
        repoEmail: inputRepoEmail,
        repoPassword: inputRepoPassword,
      });

      fetchedOrgUnit.divisions[divisionIndex].credentialRepos.push(newRepo);
      await fetchedOrgUnit.save();

      return res.status(201).send({
        message: `Credential Repo: '${inputRepoName}' added successfully to '${inputOuName}' in Division '${inputDivisionName}'.`,
      });
    } else {
      return res
        .status(403)
        .send({ message: "You do not have permission to add a repository." });
    }
  } catch (err) {
    return res.status(500).send({ message: "Error adding repo", error: err });
  }
};

// Update an existing credential repository within a division
exports.updateCredentialRepo = async function (req, res) {
  const {
    inputOuName,
    inputDivisionName,
    inputRepoName,
    inputRepoUsername,
    inputRepoEmail,
    inputRepoPassword,
  } = req.body;
  const decoded = req.user;

  if (!decoded) {
    return res.status(403).send({ message: "No token provided!" });
  }

  try {
    let fetchedOrgUnit = await OrganisationalUnitModel.findOne({
      ouName: inputOuName,
    });
    if (!fetchedOrgUnit)
      return res.status(404).send({ message: "OU not found" });

    let divisionIndex = fetchedOrgUnit.divisions.findIndex(
      (div) => div.divisionName === inputDivisionName
    );
    if (divisionIndex === -1)
      return res.status(404).send({ message: "Division not found" });

    let credRepoIndex = fetchedOrgUnit.divisions[
      divisionIndex
    ].credentialRepos.findIndex((repo) => repo.repoName === inputRepoName);
    if (credRepoIndex === -1)
      return res.status(404).send({ message: "Credential Repo not found" });

    // Only management and admin roles can update the repository
    if (decoded.role === "management" || decoded.role === "admin") {
      if (inputRepoUsername)
        fetchedOrgUnit.divisions[divisionIndex].credentialRepos[
          credRepoIndex
        ].repoUsername = inputRepoUsername;
      if (inputRepoEmail)
        fetchedOrgUnit.divisions[divisionIndex].credentialRepos[
          credRepoIndex
        ].repoEmail = inputRepoEmail;
      if (inputRepoPassword)
        fetchedOrgUnit.divisions[divisionIndex].credentialRepos[
          credRepoIndex
        ].repoPassword = inputRepoPassword;

      await fetchedOrgUnit.save();
      return res
        .status(200)
        .send({
          message: `Updated Credential Repo: '${inputRepoName}' in '${inputOuName}' Division '${inputDivisionName}'.`,
        });
    } else {
      return res
        .status(403)
        .send({
          message:
            "Access denied. You do not have credential repo update permissions.",
        });
    }
  } catch (err) {
    return res.status(500).send({ message: "Error updating repo", error: err });
  }
};

// Unassign a user from an OU and all its divisions
exports.unassignOuUser = async function (req, res) {
  const { userName, ouName } = req.body;
  const decoded = req.user;

  // Only admins can unassign users
  if (decoded.role !== "admin") {
    return res.status(403).send({ message: "Only admins can unassign users." });
  }

  try {
    // Remove user from OU and its divisions
    await OrganisationalUnitModel.updateMany(
      { ouName: ouName },
      { $pull: { ouUsers: userName } }
    );
    await OrganisationalUnitModel.updateMany(
      { ouName: ouName },
      { $pull: { "divisions.$[].divisionUsers": userName } }
    );

    return res.send({
      message: `${userName} has been unassigned from ${ouName}.`,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ message: `Error unassigning user: ${err.message}` });
  }
};

// Unassign a user from a specific division within an OU
exports.unassignDivisionUser = async function (req, res) {
  const { userName, ouName, divisionName } = req.body;
  const decoded = req.user;

  // Only admins can unassign users from divisions
  if (decoded.role !== "admin") {
    return res.status(403).send({ message: "Only admins can unassign users." });
  }

  try {
    // Remove user from the specified division
    await OrganisationalUnitModel.updateOne(
      { ouName: ouName, "divisions.divisionName": divisionName },
      { $pull: { "divisions.$.divisionUsers": userName } }
    );
    return res.send({
      message: `${userName} has been unassigned from ${divisionName}.`,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ message: `Error unassigning user: ${err.message}` });
  }
};

// Assign a user to an OU and optionally a division within that OU
exports.assignToNewOU = async function (req, res) {
  const { selectedUserName, selectedOU, selectedDivision } = req.body;
  const decoded = req.user;

  if (!decoded) {
    return res.status(403).send({ message: "No token provided!" });
  }

  try {
    // Fetch the OU and validate division if selected
    let fetchedOrgUnit = await OrganisationalUnitModel.findOne({
      ouName: selectedOU,
    });
    if (!fetchedOrgUnit)
      return res.status(404).send({ message: "OU not found" });

    // If a division is selected (not 'none'), validate it exists
    let divisionIndex = -1;
    if (selectedDivision !== "none") {
      divisionIndex = fetchedOrgUnit.divisions.findIndex(
        (div) => div.divisionName === selectedDivision
      );
      // If the division is selected but not found, return an error
      if (divisionIndex === -1)
        return res.status(404).send({ message: "Division not found" });
    }

    // Check if the user is already assigned to the OU or Division
    const isAssignedToOU = fetchedOrgUnit.ouUsers.includes(selectedUserName);
    const isAssignedToDivision =
      selectedDivision !== "none" &&
      fetchedOrgUnit.divisions[divisionIndex].divisionUsers.includes(
        selectedUserName
      );

    // Admins can assign users to OUs and divisions
    if (decoded.role === "admin") {
      if (isAssignedToOU && selectedDivision === "none") {
        return res
          .status(400)
          .send({
            message: `User '${selectedUserName}' is already assigned to OU '${fetchedOrgUnit.ouName}'. Cannot assign to the same OU again.`,
          });
      } else if (isAssignedToOU && selectedDivision !== "none") {
        // If the user is already assigned to the division, return an error
        if (isAssignedToDivision) {
          return res
            .status(400)
            .send({
              message: `User '${selectedUserName}' is already assigned to Division '${selectedDivision}' in OU '${selectedOU}'.`,
            });
        }
        // Add the user to the division
        fetchedOrgUnit.divisions[divisionIndex].divisionUsers.push(
          selectedUserName
        );
        await fetchedOrgUnit.save();
        return res
          .status(200)
          .send({
            message: `User '${selectedUserName}' has been assigned to Division '${selectedDivision}' in OU '${selectedOU}'.`,
          });
      } else {
        // Add the user to the OU and optionally the division
        fetchedOrgUnit.ouUsers.push(selectedUserName);
        if (selectedDivision !== "none") {
          fetchedOrgUnit.divisions[divisionIndex].divisionUsers.push(
            selectedUserName
          );
        }
        await fetchedOrgUnit.save();
        if (selectedDivision !== "none") {
          return res
            .status(200)
            .send({
              message: `User '${selectedUserName}' has been assigned to OU '${selectedOU}' and Division '${selectedDivision}'.`,
            });
        } else {
          // Only admins can perform this operation
          return res
            .status(200)
            .send({
              message: `User '${selectedUserName}' has been assigned to OU '${selectedOU}'.`,
            });
        }
      }
    } else {
      return res
        .status(403)
        .send({
          message: "Only admins can assign users to OUs and Divisions.",
        });
    }
  } catch (err) {
    // Handle errors
    console.error(err);
    return res
      .status(500)
      .send({ message: "Error assigning user.", error: err });
  }
};
