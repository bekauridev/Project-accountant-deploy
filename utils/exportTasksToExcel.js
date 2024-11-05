const excelJs = require("exceljs");
const Organization = require("../models/organizationModel");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("./AppError");

// @desc   convert JSON data to Excel format
// @route  GET /api/v1/tasks/export-tasks
// @access Private
const convertJsonToExcel = asyncMiddleware(async (req, res, next) => {
  const user = req.user;

  // Retrieve all organizations associated with the user, including tasks
  const allOrganizations = await Organization.find({ user: user._id }).populate("tasks");

  // Filter organizations to include only those with tasks
  const validOrganizations = allOrganizations.filter(
    (org) => org.tasks && org.tasks.length > 0
  );

  // If no valid organizations are found, return an error
  if (validOrganizations.length === 0) {
    return next(new AppError("No organizations with valid task criteria found", 400));
  }

  // Initialize Excel workbook and sheet with specific page setup
  const workbook = new excelJs.Workbook();
  const sheet = workbook.addWorksheet("Monthly Completed Tasks", {
    pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
  });

  // Generate header columns dynamically
  const { columns, taskNames } = generateHeaderColumns(validOrganizations);
  // display columns
  sheet.columns = columns;

  // display Tittle top of document
  displayTittle(validOrganizations, user, sheet);

  // Populate the Excel sheet rows with data for each organization
  validOrganizations.forEach((org, index) => {
    // Generate row data for header columns
    const mainRowData = generateRowData(org, index);
    const mainOrgRow = sheet.addRow(mainRowData); // display row data
    // Apply custom row formatting
    applyRowFormatting(mainOrgRow, org, taskNames);
  });

  // Set all column widths based on content length
  setColumnWidths(sheet);

  // Apply formatting to headers
  applyHeaderFormatting(sheet);

  // Set response headers for Excel file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${user.name}_tasks.xlsx`);

  // Write the workbook to response and end the response
  await workbook.xlsx.write(res);
  res.end();
});

// Generate columns based on unique task titles and prepare the header
const generateHeaderColumns = (validOrganizations) => {
  // Define default columns
  const columns = [
    { header: "#", key: "index" },
    { header: "დასახელება", key: "orgName" },
    { header: "პორტალები", key: "webData" },
  ];

  // Collect unique task titles from organizations
  const taskNames = new Set();
  validOrganizations.forEach((org) => {
    org.tasks.forEach((task) => taskNames.add(task.title));
  });

  // Add each task title as a column with a dynamic key and width
  Array.from(taskNames).forEach((taskTitle, index) => {
    columns.push({
      header: taskTitle,
      key: `task${index + 1}`,
    });
  });

  return { columns, taskNames };
};

// Generate row data for each organization, including task details
const generateRowData = (org, index) => {
  // Compile website information into a single string
  const WebData = org.websites
    .map(
      (website) =>
        `${website.name}: \n ${website.identificationCodeRecord} \n ${website.passwordRecord}`
    )
    .join("\n");

  return {
    index: index + 1, // Row index
    orgName: `${org.type}-${org.name}`, // Organization name
    webData: WebData, // Website data
  };
};

const displayTittle = (validOrganizations, user, sheet) => {
  // Generate data
  const workType =
    validOrganizations[0]?.tasks[0]?.recurrence === "monthly"
      ? "თვის დეკლარაციები"
      : "წლის დეკლარაციები";
  const targetPeriod = validOrganizations[0]?.tasks[0]?.targetPeriod || "N/A";
  const taskYear = validOrganizations[0]?.tasks[0]?.startDate
    ? validOrganizations[0].tasks[0].startDate.getFullYear()
    : new Date().getFullYear();
  const titleText = `${user.name} - ${workType} ${targetPeriod}/${taskYear}`;

  // Display data
  sheet.insertRow(1, {
    orgName: titleText,
  });
};

// Dynamically adjust column widths based on content length
const setColumnWidths = (sheet) => {
  sheet.columns.forEach((column) => {
    let initialSize = column.header ? column.header.toString().length : 10;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > initialSize) initialSize = cellLength;
    });

    // Set width with padding
    column.width = initialSize + 5;

    // Additional width adjustment for specific columns
    if (column.header === "დასახელება") {
      if (column.width > 10) column.width += 5;
    }
  });

  // Set consistent row height
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    row.height = 15;
  });
};

// Apply cell formatting for each row based on task status
const applyRowFormatting = (row, org, taskNames) => {
  row.getCell("index").alignment = { vertical: "middle", horizontal: "center" };
  row.getCell("webData").alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // Apply specific styling to each task cell based on completion status
  Array.from(taskNames).forEach((taskTitle, taskIndex) => {
    const taskMap = new Map(org.tasks.map((task) => [task.title, task]));
    const task = taskMap.get(taskTitle); // Get task by title
    const columnKey = `task${taskIndex + 1}`;
    const cell = row.getCell(columnKey);

    // Check if the task exists and apply color based on its status
    if (!task) {
      cell.value = "არა"; // Not available for this organization
      cell.alignment = { vertical: "middle", horizontal: "center" };
    } else {
      // Apply green if completed, yellow otherwise
      if (task.status === "completed") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF00FF00" }, // Green for "completed"
        };
      } else {
        cell.value = "";
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" }, // Yellow for others
        };
      }
    }
  });

  // Apply border styling to each cell in the row
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
};

// Format the headers
const applyHeaderFormatting = (sheet) => {
  // Set width for webData column
  sheet.getColumn("webData").width = 15;

  // Format Top Tittle
  const titleRow = sheet.getRow(1);
  titleRow.font = { name: "Arial", size: 12, bold: true };
  titleRow.height = 0;

  // Format header row
  const headerRow = sheet.getRow(2);
  headerRow.height = 30;
  headerRow.alignment = { vertical: "bottom", horizontal: "center", wrapText: true };
  headerRow.font = { name: "Arial", size: 11, bold: true };
};

module.exports = convertJsonToExcel;
