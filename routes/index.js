const express = require('express')
const router = express.Router()
const axios = require('axios')
const wikijs = require('wikijs').default

router.get('/', (req, res) => {
  res.render('index')
})

router.post('/', async (req, res, next) => {
  // const text = 'I still have a dream. It is a dream deeply rooted in the American dream. I have a dream that one day this nation will rise up and live out the true meaning of its creed: "We hold these truths to be self-evident, that all men are created equal."'
  const text = req.body.text
  const result = await axios({
    method: 'post',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2018-03-19',
    auth: {
      username: '647ee03e-d3fb-40ea-85eb-0ea05f9ceafb',
      password: 'uYCkhwlYhbiR'
    },
    data: {
      text: text,
      features: {
        sentiment: {},
        keywords: {}
      }
    }
  })
  const tasks = result.data.keywords.map((keyword) => {
    return new Promise(async (resolve) => {
      try {
        const wiki = await wikijs().page(keyword.text)
        const summary = await wiki.summary()
        resolve({
          keyword: keyword.text,
          summary
        })
      } catch (e) {
        resolve(null)
      }
    })
  })
  const wikis = (await Promise.all(tasks)).filter(a => a)
  res.json(wikis)
})

module.exports = router
