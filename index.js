const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const token = '6865602246:AAF_mgqN1JWbI7T5Jre9qCP4p4GKZSO4WUc';
const token2 = '6967885449:AAEBv6jCvWew_HsZktan56-HYkNOARb8YKM';

const bot = new TelegramBot(token, { polling: true });
const bot2 = new TelegramBot(token2, { polling: true });

const Languages = ['Ukraine', 'English', 'Spain', 'Russia'];

const LanguagesText = {
  Ukraine: {
    firstText: 'Вас вітає бюро перекладів Вавілон, на яку мову ви хотіли б зробити переклад?',
    translateIn: 'переклад на Ukraine',
    sendUs: 'надішліть нам ваш документ',
    userInfo:
      "надішліть нам ваш ваші дані: Ім'я, номер телефону, електронна пошта за данним форматом",
    sendButtonText: 'поширити данні',
  },
  Russia: {
    firstText:
      'Greetings from Babylon Translation Bureau. What language would you like the translation to be?',
    translateIn: 'перевод на Russia',
    sendUs: 'отправте нам ваш документ',
    userInfo:
      'отправьте нам ваши данные: Имя, номер телефона, электронная почта по данному формату',
    sendButtonText: 'поширити данні',
  },
  English: {
    firstText:
      'Babylon Translation Bureau welcomes you, in which language would you like to translate?',
    translateIn: 'translation into English',
    sendUs: 'send us your document',
    userInfo: 'send us your data: Name, phone number, e-mail in the given format',
    sendButtonText: 'поширити данні',
  },
  Spain: {
    firstText:
      'Le da la bienvenida la Agencia de Traducciones Babilonia. ¿En qué idioma le gustaría realizar la traducción?',
    translateIn: 'traducción al Spain',
    sendUs: 'envíanos tu documento',
    userInfo:
      'envíanos tus datos: Nombre, número de teléfono, correo electrónico en el formato indicado',
    sendButtonText: 'поширити данні',
  },
};

const countries = [Languages.slice(0, 2), Languages.slice(2), ['/start']];

bot.onText(/\/start/, (msg) => {
  const keyboards = countries.map((arr) => arr.map((countrie) => countrie));

  const chatId = msg.chat.id;

  const keyboard = {
    reply_markup: {
      keyboard: keyboards,
      resize_keyboard: true,
    },
  };

  bot.sendMessage(
    chatId,
    'Choose a communication language that is comfortable for you (вибрати зручну для вас мову спілкування)',
    keyboard
  );
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  const keyboards = countries.map((arr) =>
    arr.map((countrie) => LanguagesText[countrie]?.translateIn || '')
  );

  const keyboard = {
    reply_markup: {
      keyboard: keyboards,
      resize_keyboard: true,
    },
  };

  if (LanguagesText[messageText]?.firstText) {
    bot.sendMessage(chatId, LanguagesText[messageText].firstText, keyboard);
  }

  switch (messageText) {
    case LanguagesText.Ukraine.translateIn:
      bot.sendMessage(chatId, LanguagesText.Ukraine.userInfo, {
        reply_markup: {
          keyboard: [[{ text: LanguagesText.Ukraine.sendButtonText, request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });

      break;

    case LanguagesText.Russia.translateIn:
      bot.sendMessage(chatId, LanguagesText.Russia.sendUs, keyboard);
      // bot2.sendMessage(chatId, `перевод на Russia user id #${chatId}`);
      break;

    case LanguagesText.English.translateIn:
      bot.sendMessage(chatId, LanguagesText.English.sendUs, keyboard);
      // bot2.sendMessage(chatId, `перевод на English user id #${chatId}`);
      break;

    case LanguagesText.Spain.translateIn:
      bot.sendMessage(chatId, LanguagesText.Spain.sendUs, keyboard);
      // bot2.sendMessage(chatId, `перевод на Spain user id #${chatId}`);
      break;
  }
});

bot.on('contact', (msg) => {
  const chatId = msg.chat.id;

  bot2.sendMessage('-4086211595', `данные пользователя #${chatId} ${JSON.stringify(msg.contact)}`);

  bot.sendMessage(chatId, LanguagesText.Ukraine.sendUs);
});

// Обработчик для получения изображений
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.photo[msg.photo.length - 1].file_id;

  bot.getFile(fileId).then((fileInfo) => {
    //TODO for local save

    const fileUniqueName = `${Date.now()}_${path.basename(fileInfo.file_path)}`;

    const fileStream = bot.getFileStream(fileId);

    const userDirectory = path.join(__dirname, chatId.toString());

    if (!fs.existsSync(userDirectory)) {
      fs.mkdirSync(userDirectory);
    }

    const filePath = path.join(userDirectory, fileUniqueName);

    try {
      // save image
      fileStream.pipe(fs.createWriteStream(filePath));
    } catch (e) {
      console.error('Ошибка записи файла:', error);
    }

    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        try {
          bot2.sendPhoto('-4086211595', fs.readFileSync(filePath), {
            caption: `документ от пользователя id ${chatId}`,
          });
        } catch (e) {
          console.error('Ошибка отправки картинки:', error);
        }
      }
    }, 300);

    //response for user
    bot.sendMessage(chatId, 'Спасибо за обращение в ближайшее время мы свяжемся с вами!');
  });
});

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   const messageText = msg.text;
//
//   // Обработка действий в зависимости от нажатой кнопки
//   switch (messageText) {
//     case 'Кнопка 1':
//       // Ваш код для действия по кнопке 1
//       bot.sendMessage(chatId, 'Вы нажали на Кнопку 1');
//       break;
//     case 'Кнопка 2':
//       // Ваш код для действия по кнопке 2
//       bot.sendMessage(chatId, 'Вы нажали на Кнопку 2');
//       break;
//     case 'Кнопка 3':
//       // Ваш код для действия по кнопке 3
//       bot.sendMessage(chatId, 'Вы нажали на Кнопку 3');
//       break;
//     case 'Кнопка 4':
//       // Ваш код для действия по кнопке 4
//       bot.sendMessage(chatId, 'Вы нажали на Кнопку 4');
//       break;
//     default:
//       // Обработка других сообщений
//       break;
//   }
// });
