const mongoose = require("mongoose");


const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    createdBy: { type: String, required: true },
    assignedTo: String,
    statustext: String
}, { timestamps: { createdAt: "created_on", updatedAt: "updated_on" } });




module.exports = new mongoose.model("Issue", issueSchema);