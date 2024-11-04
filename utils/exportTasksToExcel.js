const excelJs = require("exceljs");
const Organization = require("../models/organizationModel");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("./AppError");
// V1
// convertJsonToExcel = asyncMiddleware(async (req, res, next) => {
//   try {
//     const user = req.user; // User data from req.user
//     // const organizations = await Organization.find({
//     //   user: user.id, // Find organizations tied to the user
//     //   tasks: { $exists: true, $not: { $size: 0 } }, // Ensure organization has tasks
//     // }).populate("tasks");

//     // // Filter organizations with only monthly and completed tasks
//     // const validOrganizations = organizations.filter((org) =>
//     //   org.tasks.every(
//     //     (task) => task.recurrence === "monthly" && task.status === "completed"
//     //   )
//     // );

//     // if (validOrganizations.length === 0) {
//     //   return next(new AppError("No organizations with valid task criteria found", 400));
//     // }
//     const validOrganizations = await Organization.find({ user: user._id })
//       .populate("tasks")
//       .populate("user");
//     // Create a new workbook and add a worksheet
//     const workbook = new excelJs.Workbook();
//     const sheet = workbook.addWorksheet("Monthly Completed Tasks", {
//       pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
//     });

//     // Define the header columns
//     sheet.columns = [
//       { header: "dasaxeleba", key: "orgName", width: 25 },
//       { header: "User Name", key: "userName", width: 20 },
//       { header: "Task Title", key: "taskTitle", width: 25 },
//       { header: "Start Date", key: "startDate", width: 15 },
//       { header: "Deadline", key: "deadline", width: 15 },
//       { header: "Status", key: "status", width: 10 },
//     ];

//     // Populate rows for each task in valid organizations
//     validOrganizations.forEach((org) => {
//       org.tasks.forEach((task) => {
//         sheet.addRow({
//           orgName: `${org.type}-${org.name}`,
//           userName: `${org.user.name} ${org.user.surname}`,
//           taskTitle: task.title,
//           startDate: new Date(task.startDate).toLocaleDateString(),
//           deadline: new Date(task.deadline).toLocaleDateString(),
//           status: task.status,
//         });
//       });
//     });

//     // Insert title row at the top

//     const userName = validOrganizations[0]?.user.name;
//     const workType =
//       validOrganizations[0]?.tasks[0]?.recurrence === "monthly"
//         ? "თვის დეკლარაციები"
//         : "წლის დეკლარაციები";
//     const targetPeriod = validOrganizations[0]?.tasks[0]?.targetPeriod;
//     const taskYear = validOrganizations[0]?.tasks[0]?.startDate.getFullYear();

//     sheet.insertRow(1, {
//       userName: `${userName}-${workType}-${targetPeriod}-${taskYear}`,
//     });
//     // curr user name - target month from task
//     // Order to make this tittle at top
//     const titleRow = sheet.getRow(1);
//     titleRow.font = { font: "robboto", size: 12, bold: true };

//     // Apply borders to the header row
//     const headerRow = sheet.getRow(2);
//     headerRow.eachCell((cell) => {
//       cell.border = {
//         top: { style: "thin" },
//         bottom: { style: "thin" },
//       };
//     });

//     // Apply styling for task status column
//     sheet.getColumn("status").eachCell((cell, rowNumber) => {
//       if (rowNumber > 1) {
//         // Skip the header
//         if (cell.value === "completed") {
//           cell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "FF808080" }, // Darker gray color
//           };
//         }
//         cell.value = ""; // Clear "completed" text to keep only color indication
//       }
//     });

//     // Set response headers and download file
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", `attachment; filename=${user.name}_tasks.xlsx`);

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     next(error);
//   }
// });

// V2
// convertJsonToExcel = asyncMiddleware(async (req, res, next) => {
//   const user = req.user;

//   const allOrganizations = await Organization.find({
//     user: user._id,
//   })
//     .populate("tasks")
//     .populate("user");

//   const validOrganizations = allOrganizations.filter(
//     (org) => org.tasks && org.tasks.length > 0
//   );

//   if (validOrganizations.length === 0) {
//     return next(new AppError("No organizations with valid task criteria found", 400));
//   }

//   const workbook = new excelJs.Workbook();
//   const sheet = workbook.addWorksheet("Monthly Completed Tasks", {
//     pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
//   });

//   // Define basic columns
//   let columns = [
//     { header: "#", key: "index", width: 5 },
//     { header: "დასახელება", key: "orgName", width: 30 },
//     { header: "ვებ-მონაც", key: "webData", width: 30 },
//   ];

//   // Collect unique task titles for additional dynamic columns
//   const taskNames = new Set();
//   validOrganizations.forEach((org) => {
//     org.tasks.forEach((task) => {
//       taskNames.add(task.title);
//     });
//   });

//   Array.from(taskNames).forEach((taskTitle, index) => {
//     columns.push({
//       header: taskTitle,
//       key: `task${index + 1}`, // Unique key for each task
//       width: 20,
//     });
//   });

//   sheet.columns = columns;

//   // Center-align headers for each column (horizontal alignment only)
//   const headerRow = sheet.getRow(1);
//   headerRow.height = 30;
//   headerRow.alignment = { vertical: "bottom", horizontal: "center" };
//   headerRow.font = { name: "Arial ", size: 11, bold: true };
//   // Insert each organization and tasks into the worksheet, along with the index

//   // validOrganizations.forEach((org, index) => {
//   //   const rowData = {
//   //     index: index + 1, // Sequential number for each organization
//   //     orgName: `${org.type}-${org.name}`,
//   //     webData: `${org.websites.name} \n ${org.websites.identificationCodeRecord} \n ${org.websites.passwordRecord}`,
//   //   };

//   //   org.tasks.forEach((task) => {
//   //     const columnKey = `task${Array.from(taskNames).indexOf(task.title) + 1}`;
//   //     if (task.status === "completed") {
//   //       rowData[columnKey] = ""; // Leave cell blank if completed
//   //     }
//   //   });

//   //   const orgRow = sheet.addRow(rowData);

//   //   // Center-align the index column cells
//   //   orgRow.getCell("index").alignment = { vertical: "middle", horizontal: "center" };

//   //   // Apply color fills for completed tasks in the row
//   //   org.tasks.forEach((task) => {
//   //     const columnKey = `task${Array.from(taskNames).indexOf(task.title) + 1}`;
//   //     const cell = orgRow.getCell(columnKey);
//   //     if (task.status === "completed") {
//   //       cell.fill = {
//   //         type: "pattern",
//   //         pattern: "solid",
//   //         fgColor: { argb: "FF00FF00" }, // Green color for "completed"
//   //       };
//   //     }
//   //   });
//   // });

//   validOrganizations.forEach((org, index) => {
//     const rowData = {
//       index: index + 1, // Sequential number for each organization
//       orgName: `${org.type}-${org.name}`,
//       webData: "", // Initialize as empty
//     };

//     // If organization has websites, append their data
//     if (org.websites && org.websites.length > 0) {
//       org.websites.forEach((website) => {
//         rowData.webData += `${website.name}\nID: ${website.identificationCodeRecord}\nPassword: ${website.passwordRecord}\n\n`;
//       });
//     }

//     org.tasks.forEach((task) => {
//       const columnKey = `task${Array.from(taskNames).indexOf(task.title) + 1}`;
//       if (task.status === "completed") {
//         rowData[columnKey] = ""; // Leave cell blank if completed
//       }
//     });

//     const orgRow = sheet.addRow(rowData);

//     orgRow.getCell("webData").alignment = {
//       vertical: "top",
//       horizontal: "center",
//       wrapText: true,
//     };
//     // Center-align the index column cells
//     orgRow.getCell("index").alignment = { vertical: "middle", horizontal: "center" };

//     // Apply color fills for completed tasks in the row
//     org.tasks.forEach((task) => {
//       const columnKey = `task${Array.from(taskNames).indexOf(task.title) + 1}`;
//       const cell = orgRow.getCell(columnKey);
//       if (task.status === "completed") {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FF00FF00" }, // Green color for "completed"
//         };
//       }
//     });
//   });

//   // Adjust column widths based on content (apply before inserting the title row)
//   sheet.columns.forEach((column) => {
//     let maxLength = 10;
//     column.eachCell({ includeEmpty: true }, (cell) => {
//       const cellValue = cell.value ? cell.value.toString().length : 0;
//       if (cellValue > maxLength) maxLength = cellValue;
//     });
//     column.width = maxLength + 6;
//   });

//   // Override the Adjusted column widths
//   sheet.getColumn("index").width = 5;
//   sheet.getColumn("webData").width = 15;
//   sheet.getColumn("webData").height = 15;

//   // Insert title row at the top
//   const userName = validOrganizations[0]?.user.name;
//   const workType =
//     validOrganizations[0]?.tasks[0]?.recurrence === "monthly"
//       ? "თვის დეკლარაციები"
//       : "წლის დეკლარაციები";
//   const targetPeriod = validOrganizations[0]?.tasks[0]?.targetPeriod;
//   const taskYear = validOrganizations[0]?.tasks[0]?.startDate.getFullYear();

//   sheet.insertRow(1, {
//     orgName: `${userName}-${workType} ${targetPeriod}/${taskYear}`,
//   });

//   const titleRow = sheet.getRow(1);
//   titleRow.font = { font: "Arial", size: 12, bold: true };
//   titleRow.height = 0;

//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader("Content-Disposition", `attachment; filename=${user.name}_tasks.xlsx`);

//   await workbook.xlsx.write(res);
//   res.end();
// });

// V3
// const convertJsonToExcel = asyncMiddleware(async (req, res, next) => {
//   const user = req.user;

//   const allOrganizations = await Organization.find({
//     user: user._id,
//   })
//     .populate("tasks")
//     .populate("user");

//   const validOrganizations = allOrganizations.filter(
//     (org) => org.tasks && org.tasks.length > 0
//   );

//   if (validOrganizations.length === 0) {
//     return next(new AppError("No organizations with valid task criteria found", 400));
//   }

//   const workbook = new excelJs.Workbook();
//   const sheet = workbook.addWorksheet("Monthly Completed Tasks", {
//     pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
//   });

//   // Define basic columns
//   let columns = [
//     { header: "#", key: "index", width: 5 },
//     { header: "დასახელება", key: "orgName", width: 30 },
//     { header: "ვებ-მონაც", key: "webData", width: 15 }, // Compact display for preview
//   ];

//   // Collect unique task titles for additional dynamic columns
//   const taskNames = new Set();
//   validOrganizations.forEach((org) => {
//     org.tasks.forEach((task) => {
//       taskNames.add(task.title);
//     });
//   });

//   Array.from(taskNames).forEach((taskTitle, index) => {
//     columns.push({
//       header: taskTitle,
//       key: `task${index + 1}`, // Unique key for each task
//       width: 20,
//     });
//   });

//   sheet.columns = columns;

//   // Center-align headers for each column (horizontal alignment only)
//   const headerRow = sheet.getRow(1);
//   headerRow.height = 30;
//   headerRow.alignment = { vertical: "bottom", horizontal: "center" };
//   headerRow.font = { name: "Arial", size: 11, bold: true };

//   validOrganizations.forEach((org, index) => {
//     const previewWebData =
//       org.websites && org.websites.length > 0
//         ? `${org.websites[0].name}...` // Show only the first website name as a preview
//         : "";

//     const mainRowData = {
//       index: index + 1,
//       orgName: `${org.type}-${org.name}`,
//       webData: previewWebData, // Show preview of website data
//     };

//     const mainOrgRow = sheet.addRow(mainRowData);

//     // Center-align the "index" column cells
//     mainOrgRow.getCell("index").alignment = { vertical: "middle", horizontal: "center" };

//     // Wrap text in the preview cell for "webData"
//     mainOrgRow.getCell("webData").alignment = {
//       vertical: "middle",
//       horizontal: "center",
//       wrapText: true,
//     };

//     // Apply color fills for completed tasks in the row
//     org.tasks.forEach((task) => {
//       const columnKey = `task${Array.from(taskNames).indexOf(task.title) + 1}`;
//       const cell = mainOrgRow.getCell(columnKey);
//       if (task.status === "completed") {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FF00FF00" }, // Green color for "completed"
//         };
//       }
//     });

//     // Add grouped rows for full website information
//     if (org.websites && org.websites.length > 0) {
//       org.websites.forEach((website) => {
//         const detailRowData = {
//           index: "", // Leave index blank for grouped rows
//           orgName: "", // Leave organization name blank for grouped rows
//           webData: `Name: ${website.name} | ID: ${website.identificationCodeRecord} | Password: ${website.passwordRecord}`,
//         };
//         const detailRow = sheet.addRow(detailRowData);
//         detailRow.outlineLevel = 1; // Group under main row
//         // detailRow.hidden = true; // Start hidden, expandable via "+" button

//         // Wrap text in the detailed "webData" cell
//         detailRow.getCell("webData").alignment = {
//           vertical: "top",
//           horizontal: "left",
//           wrapText: true,
//         };
//       });
//     }
//   });

//   // Adjust column widths based on content
//   sheet.columns.forEach((column) => {
//     let maxLength = 10;
//     column.eachCell({ includeEmpty: true }, (cell) => {
//       const cellValue = cell.value ? cell.value.toString().length : 0;
//       if (cellValue > maxLength) maxLength = cellValue;
//     });
//     column.width = maxLength + 6;
//   });

//   // Override specific column widths for fixed layout
//   sheet.getColumn("index").width = 5;
//   sheet.getColumn("webData").width = 15; // Keep this narrow for compactness

//   // Insert title row at the top
//   const userName = validOrganizations[0]?.user.name;
//   const workType =
//     validOrganizations[0]?.tasks[0]?.recurrence === "monthly"
//       ? "თვის დეკლარაციები"
//       : "წლის დეკლარაციები";
//   const targetPeriod = validOrganizations[0]?.tasks[0]?.targetPeriod;
//   const taskYear = validOrganizations[0]?.tasks[0]?.startDate.getFullYear();

//   sheet.insertRow(1, {
//     orgName: `${userName}-${workType} ${targetPeriod}/${taskYear}`,
//   });

//   const titleRow = sheet.getRow(1);
//   titleRow.font = { name: "Arial", size: 12, bold: true };
//   titleRow.height = 0;

//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader("Content-Disposition", `attachment; filename=${user.name}_tasks.xlsx`);

//   await workbook.xlsx.write(res);
//   res.end();
// });

// V4 fine
// const convertJsonToExcel = asyncMiddleware(async (req, res, next) => {
//   const user = req.user;

//   const allOrganizations = await Organization.find({
//     user: user._id,
//   })
//     .populate("tasks")
//     .populate("user");

//   const validOrganizations = allOrganizations.filter(
//     (org) => org.tasks && org.tasks.length > 0
//   );

//   if (validOrganizations.length === 0) {
//     return next(new AppError("No organizations with valid task criteria found", 400));
//   }

//   const workbook = new excelJs.Workbook();
//   // !!!!!!!!!!!!!!!!!!!
//   const sheet = workbook.addWorksheet("Monthly Completed Tasks", {
//     pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
//   });

//   // Define basic columns
//   let columns = [
//     { header: "#", key: "index", width: 5 },
//     { header: "დასახელება", key: "orgName", width: 30 },
//     { header: "ვებ-მონაც", key: "webData", width: 15 }, // Compact display for preview
//   ];

//   // Collect unique task titles for additional dynamic columns
//   const taskNames = new Set();
//   validOrganizations.forEach((org) => {
//     org.tasks.forEach((task) => {
//       taskNames.add(task.title);
//     });
//   });

//   Array.from(taskNames).forEach((taskTitle, index) => {
//     columns.push({
//       header: taskTitle,
//       key: `task${index + 1}`, // Unique key for each task
//       width: 20,
//     });
//   });

//   sheet.columns = columns;

//   validOrganizations.forEach((org, index) => {
//     // Collect the full web data details
//     const fullWebData = org.websites
//       .map(
//         (website) =>
//           `${website.name}: \n ${website.identificationCodeRecord} \n ${website.passwordRecord} `
//       )
//       .join("\n");
//     const mainRowData = {
//       index: index + 1,
//       orgName: `${org.type}-${org.name}`,
//       webData: fullWebData, // Show full details directly with line breaks
//     };

//     const mainOrgRow = sheet.addRow(mainRowData);

//     // Center-align the "index" column cells
//     mainOrgRow.getCell("index").alignment = { vertical: "middle", horizontal: "center" };

//     // Wrap text in the cell for "webData"
//     mainOrgRow.getCell("webData").alignment = {
//       vertical: "middle",
//       horizontal: "center",
//       wrapText: true,
//     };

//     // Apply color fills for completed tasks in the row
//     org.tasks.forEach((task) => {
//       const columnKey = `task${Array.from(taskNames).indexOf(task.title) + 1}`;
//       const cell = mainOrgRow.getCell(columnKey);

//       if (task.status === "completed") {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FF00FF00" }, // Green color for "completed"
//         };
//       }
//     });
//   });

//   sheet.columns.forEach((column) => {
//     let maxLength = 10;
//     column.eachCell({ includeEmpty: true }, (cell) => {
//       const cellValue = cell.value ? cell.value.toString().length : 0;
//       if (cellValue > maxLength) maxLength = cellValue;
//     });
//     column.width = maxLength + 6;
//     column.height = 2;
//   });

//   // Adjust All row heights
//   sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
//     row.height = 15;
//   });

//   // Override specific  widths and heights for custom layout
//   sheet.getColumn("index").width = 5;
//   sheet.getColumn("webData").width = 15; // Keep this narrow for compactness

//   // Center-align headers for each column (horizontal alignment only)
//   const headerRow = sheet.getRow(1);
//   headerRow.height = 30;
//   headerRow.alignment = { vertical: "bottom", horizontal: "center" };
//   headerRow.font = { name: "Arial", size: 11, bold: true };

//   // Insert title row at the top
//   const userName = validOrganizations[0]?.user.name;
//   const workType =
//     validOrganizations[0]?.tasks[0]?.recurrence === "monthly"
//       ? "თვის დეკლარაციები"
//       : "წლის დეკლარაციები";
//   const targetPeriod = validOrganizations[0]?.tasks[0]?.targetPeriod;
//   const taskYear = validOrganizations[0]?.tasks[0]?.startDate.getFullYear();

//   sheet.insertRow(1, {
//     orgName: `${userName}-${workType} ${targetPeriod}/${taskYear}`,
//   });

//   const titleRow = sheet.getRow(1);
//   titleRow.font = { name: "Arial", size: 12, bold: true };
//   titleRow.height = 0;

//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader("Content-Disposition", `attachment; filename=${user.name}_tasks.xlsx`);

//   await workbook.xlsx.write(res);
//   res.end();
// });

// V5
const convertJsonToExcel = asyncMiddleware(async (req, res, next) => {
  // All necessary data
  const user = req.user;

  const allOrganizations = await Organization.find({
    user: user._id,
  }).populate("tasks");

  const validOrganizations = allOrganizations.filter(
    (org) => org.tasks && org.tasks.length > 0
  );

  if (validOrganizations.length === 0) {
    return next(new AppError("No organizations with valid task criteria found", 400));
  }
  // Excel setup
  const workbook = new excelJs.Workbook();
  const sheet = workbook.addWorksheet("Monthly Completed Tasks", {
    pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
  });

  // Define basic columns
  let columns = [
    { header: "#", key: "index", width: 5 },
    { header: "დასახელება", key: "orgName", width: 30 },
    { header: "ვებ-მონაც", key: "webData", width: 15 },
  ];

  // Collect unique task titles for additional dynamic columns
  const taskNames = new Set();
  validOrganizations.forEach((org) => {
    org.tasks.forEach((task) => {
      taskNames.add(task.title);
    });
  });

  // Display Unique task names as a header
  Array.from(taskNames).forEach((taskTitle, index) => {
    columns.push({
      header: taskTitle,
      key: `task${index + 1}`, // Unique key for each
      width: 20,
    });
  });
  sheet.columns = columns;

  validOrganizations.forEach((org, index) => {
    // Convert org.tasks to a Map for quick lookup
    const taskMap = new Map(org.tasks.map((task) => [task.title, task]));

    const WebData = org.websites
      .map(
        (website) =>
          `${website.name}: \n ${website.identificationCodeRecord} \n ${website.passwordRecord}`
      )
      .join("\n");

    const mainRowData = {
      index: index + 1,
      orgName: `${org.type}-${org.name}`,
      webData: WebData,
    };

    const mainOrgRow = sheet.addRow(mainRowData);

    // Center-align the "index" column cells
    mainOrgRow.getCell("index").alignment = { vertical: "middle", horizontal: "center" };

    // Wrap text in the cell for "webData"
    mainOrgRow.getCell("webData").alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    // Use the taskMap to determine task presence and status efficiently
    Array.from(taskNames).forEach((taskTitle, taskIndex) => {
      const task = taskMap.get(taskTitle); // Efficient lookup in the map
      const columnKey = `task${taskIndex + 1}`;
      const cell = mainOrgRow.getCell(columnKey);

      if (!task) {
        // If the task does not belong to the organization
        cell.value = "არა";
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        // If the task belongs to the organization, check its status
        if (task.status === "completed") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00FF00" }, // Green color for "completed"
          };
        } else {
          cell.value = ""; // Leave empty or fill with white
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" },
          };
        }
      }
    });

    // Add borders to the row cells
    mainOrgRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString().length : 0;
      if (cellValue > maxLength) maxLength = cellValue;
    });
    column.width = maxLength + 6;
    column.height = 2;
  });

  // Adjust All row heights
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    row.height = 15;
  });

  // Override specific widths and heights for custom layout
  sheet.getColumn("index").width = 5;
  sheet.getColumn("webData").width = 15; // Keep this narrow for compactness

  // Center-align headers for each column (horizontal alignment only)
  const headerRow = sheet.getRow(1);
  headerRow.height = 30;
  headerRow.alignment = { vertical: "bottom", horizontal: "center", wrapText: true };
  headerRow.font = { name: "Arial", size: 11, bold: true };

  // Insert title row at the top
  const userName = req.user.name;
  const workType =
    validOrganizations[0]?.tasks[0]?.recurrence === "monthly"
      ? "თვის დეკლარაციები"
      : "წლის დეკლარაციები";
  const targetPeriod = validOrganizations[0]?.tasks[0]?.targetPeriod;
  const taskYear = validOrganizations[0]?.tasks[0]?.startDate.getFullYear();

  sheet.insertRow(1, {
    orgName: `${userName}-${workType} ${targetPeriod}/${taskYear}`,
  });

  const titleRow = sheet.getRow(1);
  titleRow.font = { name: "Arial", size: 12, bold: true };
  titleRow.height = 0;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${user.name}_tasks.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = convertJsonToExcel;
