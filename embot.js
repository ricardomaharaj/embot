require("dotenv").config()
const { Telegraf } = require("telegraf")
const axios = require("axios")
const TMDB_TOKEN = process.env.TMDB
const TG_TOKEN = process.env.TG
const bot = new Telegraf(TG_TOKEN)

bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query
    if (query !== '') {
        axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_TOKEN}&language=en-US&query=${query}&page=1`)
            .then((res) => {
                let titles = res.data.results
                    .filter(({ poster_path }) => poster_path)
                    .map(({ poster_path, id, overview, name, title, release_date, first_air_date, media_type }) => ({
                        type: 'article',
                        id: id,
                        title: `${(title || name)} ${(release_date || first_air_date)}`,
                        description: overview,
                        thumb_url: `https://image.tmdb.org/t/p/original${poster_path}`,
                        input_message_content: {
                            message_text: `https://www.themoviedb.org/${(media_type == "tv") ? "tv" : "movie"}/${id}`
                        }
                    }))
                return ctx.answerInlineQuery(titles)
            })
            .catch(err => console.log(err))
    }
})

bot.launch().catch(err => console.error(err))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
