const asyncMiddleware = require("../middlewares/asyncMiddleware");
const ApiFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");

// Display All document
exports.indexDoc = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });

// Display single document
exports.showDoc = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc)
      return next(new AppError(`No document found with id of ${req.params.id}`, 404));

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

// Create single document
exports.storeDoc = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      doc,
    });
  });

// Update single document
exports.updateDoc = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No document found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

// Delete single document
exports.destroyDoc = (Model) =>
  asyncMiddleware(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, req.body);
    if (!doc) {
      return next(new AppError(`No document found with id of ${req.params.id}`, 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
