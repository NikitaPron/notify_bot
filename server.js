const TelegramApi = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.TOKEN;

const bot = new TelegramApi(token, { polling: true });
let notifies = [];
let notify = "";
bot.on("message", async (msg) => {
  const text = msg.text;
  const id = msg.chat.id;

  console.log(`Новое сообщение: ${text}`);
  if (text.match(/\d\d:\d\d/g)) {
    const time = text;
    await bot.sendMessage(id, `Напоминание создано: ${notify} в ${time}`);
    notifies.push({
      id,
      noteId: Date.now(),
      notify,
      time,
    });
    notify = "";
  } else if (text === "мои") {
    notifies
      .filter((noty) => noty.id === id)
      .forEach((noty) => {
        bot.sendMessage(id, noty.notify + " в " + noty.time);
      });
  } else {
    notify = text;
    await bot.sendMessage(id, `Текст напоминания: ${text}`);
    await bot.sendMessage(id, `Теперь напишите время в формате 03:47`);
  }
});

function checkNotifies() {
  const idToDelete = [];
  notifies.forEach((n) => {
    if (isTimeToShowNotify(n.time)) {
      bot.sendMessage(n.id, n.notify);
      idToDelete.push(n.noteId);
    }
  });

  notifies = notifies.filter((n) => !idToDelete.includes(n.noteId));

  console.log(notifies.length);
}

function isTimeToShowNotify(timeNotify) {
  const date = new Date(Date.now());
  const dateNotify = new Date();
  dateNotify.setHours(timeNotify.split(":")[0]);
  dateNotify.setMinutes(timeNotify.split(":")[1]);

  return (
    date.getHours() + 3 + "" + date.getMinutes() ===
    dateNotify.getHours() + "" + dateNotify.getMinutes()
  );
}

setInterval(checkNotifies, 5000);
