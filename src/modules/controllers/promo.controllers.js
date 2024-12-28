import { promoModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";

// Add one promo
export const addNewPromo = ErrorHandlerService(async (req, res) => {
  const { id: userId } = req.user;
  req.body.addedBy = userId;

  const newPromo = await promoModel.create(req.body);
  if (!newPromo) throw new AppErrorService(404, "Failed to add new promo");

  res.status(201).json({
    message: "Promo added successfully",
    data: newPromo,
  });
});

// Update one promo
export const updatePromo = ErrorHandlerService(async (req, res) => {
  const { id: userId } = req.user;
  req.body.addedBy = userId;
  const { id } = req.params;

  const [rowsUpdated] = await promoModel.update(req.body, {
    where: { id },
  });

  if (rowsUpdated === 0) {
    throw new AppErrorService(404, "Failed to update promo. Promo not found or no changes detected.");
  }
  const updatedPromo = await promoModel.findOne({ where: { id } });
  res.status(200).json({
    message: "Promo updated successfully",
    data: updatedPromo,
  });
});

// Delete one promo
export const deletePromo = ErrorHandlerService(async (req, res) => {
  const { id } = req.params;

  const rowsDeleted = await promoModel.destroy({
    where: { id },
  });

  if (rowsDeleted === 0) {
    throw new AppErrorService(404, "Failed to delete promo. Promo not found.");
  }

  res.status(200).json({
    message: "Promo deleted successfully",
  });
});

// Delete all promos
export const deleteAllPromos = ErrorHandlerService(async (req, res) => {
  const rowsDeleted = await promoModel.destroy({ truncate: true });
  res.status(200).json({
    message: "All promos deleted successfully.",
  });
});

// Get all promos
export const getAllPromos = ErrorHandlerService(async (req, res) => {
  const promos = await promoModel.findAll(req.dbQuery);
  if (!promos) throw new AppErrorService(404, "Failed to fetch all promos");

  res.status(200).json({
    message: "Promos fetched successfully",
    data: promos,
    meta: req.meta,
  });
});
