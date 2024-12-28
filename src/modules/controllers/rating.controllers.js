import { ratingModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";

// Add one rating
export const addNewRating = ErrorHandlerService(async (req, res) => {
  const { id: userId } = req.user;
  req.body.addedBy = userId;

  const newRating = await ratingModel.create(req.body);
  if (!newRating) throw new AppErrorService(404, "Failed to add new rating");

  res.status(201).json({
    message: "Rating added successfully",
    data: newRating,
  });
});

// Update one rating
export const updateRating = ErrorHandlerService(async (req, res) => {
  const { id: userId } = req.user;
  req.body.addedBy = userId;
  const { id } = req.params;

  const [rowsUpdated] = await ratingModel.update(req.body, {
    where: { id },
  });

  if (rowsUpdated === 0) {
    throw new AppErrorService(404, "Failed to update rating. Rating not found or no changes detected.");
  }
  const updatedRating = await ratingModel.findOne({ where: { id } });
  res.status(200).json({
    message: "Rating updated successfully",
    data: updatedRating,
  });
});

// Delete one rating
export const deleteRating = ErrorHandlerService(async (req, res) => {
  const { id } = req.params;

  const rowsDeleted = await ratingModel.destroy({
    where: { id },
  });

  if (rowsDeleted === 0) {
    throw new AppErrorService(404, "Failed to delete rating. Rating not found.");
  }

  res.status(200).json({
    message: "Rating deleted successfully",
  });
});

// Delete all ratings
export const deleteAllrating = ErrorHandlerService(async (req, res) => {
  const rowsDeleted = await ratingModel.destroy({ truncate: true });
  res.status(200).json({
    message: "All ratings deleted successfully.",
  });
});

// Get all ratings
export const getAllRatings = ErrorHandlerService(async (req, res) => {
  const ratings = await ratingModel.findAll(req.dbQuery);
  if (!ratings) throw new AppErrorService(404, "Failed to fetch all ratings");

  res.status(200).json({
    message: "ratings fetched successfully",
    data: ratings,
    meta: req.meta,
  });
});
