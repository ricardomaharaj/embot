const Telegraf = require("telegraf")
const axios = require("axios")
const TMDB = process.env.TMDB
const TELEGRAM = process.env.TG
const bot = new Telegraf(TELEGRAM)

function type(type) {
    return type == "tv" ? "tv" : "movie"
}

bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
    if (inlineQuery.query !== '') {
        axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB}&language=en-US&query=${inlineQuery.query}&page=1&include_adult=false`)
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
                            message_text: `https://www.themoviedb.org/${type(media_type)}/${id}`
                        }
                    }))
                return answerInlineQuery(titles)
            })
            .catch(err => console.log(err))
    }
})

bot.launch().catch(err => console.error(err))
