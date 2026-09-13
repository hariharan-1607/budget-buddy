const express = require("express");
const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All budget routes require authentication
router.use(authMiddleware);

// @route   GET /api/budgets
// @desc    Get all budgets for authenticated user
// @access  Private
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(budgets.map((b) => b.toJSON()));
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ msg: "Server error fetching budgets", error: error.message });
  }
});

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { name, totalAmount } = req.body;

    if (!name || totalAmount === undefined || totalAmount === null || totalAmount === "") {
      return res.status(400).json({ msg: "Name and total amount are required" });
    }

    const numericAmount = parseFloat(totalAmount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ msg: "Total amount must be a valid positive number" });
    }

    const budget = new Budget({
      userId: req.user.userId,
      name: name.trim(),
      totalAmount: numericAmount,
      expenses: [],
    });

    await budget.save();
    res.status(201).json(budget.toJSON());
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ msg: "Server error creating budget", error: error.message });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalAmount } = req.body;

    const budget = await Budget.findOne({ _id: id, userId: req.user.userId });
    if (!budget) {
      return res.status(404).json({ msg: "Budget not found" });
    }

    if (name) budget.name = name.trim();
    if (totalAmount !== undefined && totalAmount !== null && totalAmount !== "") {
      const numericAmount = parseFloat(totalAmount);
      if (!isNaN(numericAmount) && numericAmount >= 0) {
        budget.totalAmount = numericAmount;
      }
    }

    await budget.save();
    res.json(budget.toJSON());
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ msg: "Server error updating budget", error: error.message });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!budget) {
      return res.status(404).json({ msg: "Budget not found" });
    }

    res.json({ msg: "Budget deleted successfully", id });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ msg: "Server error deleting budget", error: error.message });
  }
});

// @route   POST /api/budgets/:budgetId/expenses
// @desc    Add an expense to a budget
// @access  Private
router.post("/:budgetId/expenses", async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { category, amount, description } = req.body;

    if (!category || amount === undefined || amount === null || amount === "") {
      return res.status(400).json({ msg: "Category and amount are required" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ msg: "Amount must be a valid positive number" });
    }

    const budget = await Budget.findOne({ _id: budgetId, userId: req.user.userId });
    if (!budget) {
      return res.status(404).json({ msg: "Budget not found" });
    }

    const newExpense = {
      category: category.trim(),
      amount: numericAmount,
      description: (description || "").trim(),
      date: new Date(),
    };

    budget.expenses.unshift(newExpense);
    await budget.save();

    const createdExpense = budget.expenses[0].toJSON();
    res.status(201).json({
      expense: createdExpense,
      budget: budget.toJSON(),
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ msg: "Server error adding expense", error: error.message });
  }
});

// @route   PUT /api/budgets/:budgetId/expenses/:expenseId
// @desc    Update an expense
// @access  Private
router.put("/:budgetId/expenses/:expenseId", async (req, res) => {
  try {
    const { budgetId, expenseId } = req.params;
    const { category, amount, description } = req.body;

    const budget = await Budget.findOne({ _id: budgetId, userId: req.user.userId });
    if (!budget) {
      return res.status(404).json({ msg: "Budget not found" });
    }

    const expense = budget.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    if (category) expense.category = category.trim();
    if (amount !== undefined && amount !== null && amount !== "") {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount) && numericAmount >= 0) {
        expense.amount = numericAmount;
      }
    }
    if (description !== undefined) expense.description = description.trim();

    await budget.save();
    res.json({
      expense: expense.toJSON(),
      budget: budget.toJSON(),
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ msg: "Server error updating expense", error: error.message });
  }
});

// @route   DELETE /api/budgets/:budgetId/expenses/:expenseId
// @desc    Delete an expense
// @access  Private
router.delete("/:budgetId/expenses/:expenseId", async (req, res) => {
  try {
    const { budgetId, expenseId } = req.params;

    const budget = await Budget.findOne({ _id: budgetId, userId: req.user.userId });
    if (!budget) {
      return res.status(404).json({ msg: "Budget not found" });
    }

    const expense = budget.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    expense.deleteOne();
    await budget.save();

    res.json({ msg: "Expense deleted successfully", expenseId, budget: budget.toJSON() });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ msg: "Server error deleting expense", error: error.message });
  }
});

module.exports = router;
