const { TransactionReport } = require("../../model");

const transactionReportController = {
  async getAllTransactions(req, res) {
    try {
      const transactions = await TransactionReport.findAll({
        include: ["inventory", "request", "performedBy"],
        order: [["transaction_date", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = transactionReportController;
