import { Op } from "sequelize";
import { cardPriceModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";

// add one
export const addNewCardPrice=ErrorHandlerService(async(req,res)=>{
  const {id:userId}=req.user;
  req.body.addedBy=userId;

  const newCardPrice=await cardPriceModel.create(req.body);
  if(!newCardPrice) throw new AppErrorService(404,"failed to add new card price");
  res.status(201).json({
    message:"card price added successfully",
    data:newCardPrice
  })
})

// update one
export const updateCardPrice = ErrorHandlerService(async (req, res) => {
  const { id: userId } = req.user;
  req.body.addedBy = userId;
  const { id } = req.params;

  const [rowsUpdated] = await cardPriceModel.update(req.body, {
    where: { id },
  });

  if (rowsUpdated === 0) {
    throw new AppErrorService(404, "Failed to update card price. Card not found or no changes detected.");
  }
  const updatedCardPrice = await cardPriceModel.findOne({ where: { id } });
  res.status(200).json({
    message: "Card price updated successfully",
    data: updatedCardPrice,
  });
});

// delete one
export const deleteCardPrice = ErrorHandlerService(async (req, res) => {
  const { id } = req.params;

  const rowsDeleted = await cardPriceModel.destroy({
    where: { id },
  });

  if (rowsDeleted === 0) {
    throw new AppErrorService(404, "Failed to delete card price. Card not found.");
  }

  res.status(200).json({
    message: "Card price deleted successfully",
  });
});


// delete all
export const deleteAllCardPrices = ErrorHandlerService(async (req, res) => {
  const rowsDeleted = await cardPriceModel.destroy({ truncate: true });
  res.status(200).json({
    message: "All card prices deleted successfully.",
  });
});


// get all
export const getAllCardPrices = ErrorHandlerService(async (req, res) => {
  const cardPrices = await cardPriceModel.findAll(req.dbQuery);
  if(!cardPrices) throw new AppErrorService(404,"failed to fetch all card prices");
  res.status(200).json({
    message: "Card prices fetched successfully",
    data: cardPrices,
    meta: req.meta,
  });
});

// activate one card price
export const activateCardPrice = ErrorHandlerService(async (req, res) => {
  const { id } = req.params;

  const updateCardPrice = await cardPriceModel.update(
    { isActive: true },
    { where: { id } }
  );

  if (!updateCardPrice) {
    throw new AppErrorService(404, 'Failed to activate card price or card not found');
  }

  const deActivate = await cardPriceModel.update(
    { isActive: false },
    {
      where: {
        id: {
          [Op.ne]: id
        }
      }
    }
  );

  if (!deActivate) {
    throw new AppErrorService(500, 'Failed to deactivate other card prices');
  }

  return res.status(200).json({
    message: 'Card price activated and other prices deactivated successfully'
  });
});