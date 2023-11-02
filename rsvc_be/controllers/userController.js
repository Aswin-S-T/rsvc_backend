const { Op } = require('sequelize');
const userService = require('../services/users');
const messageService = require('../services/messages');
const { sendEmailNotification } = require('../utils/utils');
const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;

// exports.getAgents = async (req, res) => {
//   try {
//     const users = await userService.findMany();

//     let agents = [];
//     if (users && users.length > 0) {
//       const filteredUsers = users.filter((user) => user.Role !== req.params.id);
//       agents = filteredUsers;
//     }
//     res.status(HTTP_OK).json({
//       message: 'agents',
//       data: agents,
//     });
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

exports.getAgents = async (req, res) => {
  try {
    let agent = await userService.getAllAgents();
    res.status(HTTP_OK).json({
      message: 'agents',
      data: agent,
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

exports.getBuyers = async (req, res) => {
  try {
    let agent = await userService.getAllBuyers();
    res.status(HTTP_OK).json({
      message: 'agents',
      data: agent,
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { from, to, message } = req.body;
    let messageData = {
      from,
      to,
      message,
      time: new Date(),
    };
    await messageService.updateMessage(messageData).then(() => {
      res.status(HTTP_OK).json({
        message: 'Message send successfully....',
      });
    });
  } catch (error) {
    console.log('Error : ', error);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { from, to } = req.body;

    let messages = await messageService.getAllMessages(from, to);
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.from.toString() === from,
        message: msg.message,
      };
    });
    res.status(HTTP_OK).json({
      message: 'your messages',
      data: projectedMessages,
    });
  } catch (error) {
    console.log('Error : ', error);
  }
};

// exports.notifyAgents = async (req, res) => {
//   try {
//     let to = req.body.email;
//     let subject = 'Shown interest in a property';
//     let userDetails = await userService.findOne(() => [{ where: { email: req.body.email } }]);

//     let agents = await userService.getAllAgents();

//     if (agents && agents.length > 0) {
//       for (let i = 0; i < agents.length; i++) {
//         let content = `Hello ${agents[i]?.UserName},
//         ${userDetails?.UserName} showin interest in a property.
//       `;
//         let agentEmail = agents[i]?.eMail;

//         await sendEmailNotification(agentEmail, subject, content);
//         res.status(HTTP_OK).json({
//           message: 'Email sent!!',
//         });
//       }
//     }
//   } catch (error) {
//     console.log('Error while sending Email : ', error);
//   }
// };

exports.notifyAgents = async (req, res) => {
  try {
    let to = req.body.email;
    let subject = 'Shown interest in a property';
    let userDetails = await userService.findOne(() => [{ where: { email: req.body.email } }]);

    let agents = await userService.getAllAgents();

    let emailResults = []; // Store email sending results

    if (agents && agents.length > 0) {
      for (let i = 0; i < agents.length; i++) {
        let content = `Hello ${agents[i]?.UserName},
        ${userDetails?.UserName} showing interest in a property.`;
        let agentEmail = agents[i]?.eMail;

        // Send email and store the result
        const emailResult = await sendEmailNotification(agentEmail, subject, content);
        emailResults.push(emailResult);
      }

      // Send the response after all emails have been sent
      res.status(HTTP_OK).json({
        message: 'Emails sent!',
        emailResults: emailResults,
      });
    } else {
      // If there are no agents
      res.status(HTTP_OK).json({
        message: 'No agents to notify.',
      });
    }
  } catch (error) {
    console.log('Error while sending Email: ', error);
    res.status(HTTP_ERROR).json({
      message: 'Error while sending emails.',
      error: error.message,
    });
  }
};
