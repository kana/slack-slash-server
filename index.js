const slack = require('slack-promise')
const express = require('express')
const bodyParser = require('body-parser')
const util = require('util')
const delay = util.promisify(setTimeout)

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))

app.set('port', process.env.PORT || 5000)

app.get('/', (request, response) => {
  response.send('What is the meaning of life, the universe and everything?')
})

app.post('/dokaben', async (request, response) => {
  response.set('Content-Type', 'text/plain')
  try {
    await handleDokaben(request.body)
    response.send('')
  } catch (e) {
    response.send('err')
  }
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})

async function handleDokaben (parameters) {
  const history = await fetchChannelHistory(parameters.channel_id)

  const emojiTable = getEmojiTable()
  const cs = parameters.text.split('')
  const emojis = new Set(cs.map(c => emojiTable[c]).filter(emoji => !!emoji))
  for (const emoji of emojis) {
    try {
      await addEmoji(
        parameters.channel_id,
        history.messages[0].ts,
        emoji
      )
    } catch (e) {
      // Ignore errors, especially for duplicated emoji.
    }

    await delay(300)
  }
}

function getEmojiTable () {
  return {
    'ー': 'dokaben--',
    'ア': 'dokaben-a',
    'ベ': 'dokaben-be',
    'ド': 'dokaben-do',
    'ホ': 'dokaben-ho',
    'カ': 'dokaben-ka',
    'キ': 'dokaben-ki',
    'コ': 'dokaben-ko',
    'マ': 'dokaben-ma',
    'ナ': 'dokaben-na',
    'ン': 'dokaben-nn',
    'プ': 'dokaben-pu',
    'ラ': 'dokaben-ra',
    'リ': 'dokaben-ri',
    'ル': 'dokaben-ru',
    'セ': 'dokaben-se',
    'シ': 'dokaben-shi',
    'ソ': 'dokaben-so',
    'ス': 'dokaben-su',
    'タ': 'dokaben-ta',
    'ユ': 'dokaben-yu',
  }
}

async function fetchChannelHistory (channelId) {
  return slack.channels.history({
    token: process.env.SLACK_TOKEN,
    channel: channelId,
    count: 1
  })
}

async function addEmoji (channelId, timestamp, emoji) {
  return slack.reactions.add({
    token: process.env.SLACK_TOKEN,
    channel: channelId,
    timestamp: timestamp,
    name: emoji
  })
}
