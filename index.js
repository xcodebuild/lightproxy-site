const Koa = require('koa')
const Router = require('@koa/router')
const fetch = require('node-fetch');

const { userAgent } = require('koa-useragent');

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'


const server = new Koa()
const router = new Router()

server.use(userAgent);
router.use(userAgent);
server.use(router.routes())

router.all('*', async ctx => {
    if (ctx.url.endsWith('.png') || ctx.url.endsWith('.jpeg')) {
        ctx.redirect(`https://cdn.jsdelivr.net/gh/alibaba/lightproxy@gh-pages/${ctx.request.path}`);
        ctx.set('cache-control', 'public, max-age=604800, s-maxage=43200');
    } else if (ctx.url === 'sitemap.xml') {
        const res = await fetch('https://raw.githubusercontent.com/alibaba/lightproxy/gh-pages/sitemap.xml');
        const text = await res.text();
        ctx.set('cache-control', 's-maxage=1, stale-while-revalidate');
        ctx.body = text;
    } else {
        const res = await fetch('https://raw.githubusercontent.com/alibaba/lightproxy/gh-pages/index.html');
        const text = (await res.text()).replace(/(\/umi\..*?\.js|\/umi\..*?\.css)/g, 'https://cdn.jsdelivr.net/gh/alibaba/lightproxy@gh-pages/$1');
        ctx.set('cache-control', 's-maxage=1, stale-while-revalidate');
        ctx.body = text;
    }
});


server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
})