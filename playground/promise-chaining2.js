require("../src/db/mongoose");
const Task = require("../src/models/task");

const deleteTaskAndCount = async (id, isCompleted) => {
  const document = await Task.findByIdAndDelete(id);
  const documentCount = await Task.countDocuments({ completed: isCompleted });
  return documentCount;
};

deleteTaskAndCount("5d656c30be49f028c6803d39", false)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.log(error);
  });
