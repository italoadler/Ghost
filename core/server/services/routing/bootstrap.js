const debug = require('ghost-ignition').debug('services:routing:bootstrap');
const _ = require('lodash');
const settingsService = require('../settings');
const StaticRoutesRouter = require('./StaticRoutesRouter');
const StaticPagesRouter = require('./StaticPagesRouter');
const CollectionRouter = require('./CollectionRouter');
const TaxonomyRouter = require('./TaxonomyRouter');
const PreviewRouter = require('./PreviewRouter');
const ParentRouter = require('./ParentRouter');

const registry = require('./registry');

/**
 * Create a set of default and dynamic routers defined in the routing yaml.
 *
 * @TODO:
 *   - is the PreviewRouter an app?
 */
module.exports = function bootstrap() {
    debug('bootstrap');

    registry.resetAllRouters();
    registry.resetAllRoutes();

    const siteRouter = new ParentRouter('site');
    const previewRouter = new PreviewRouter();

    siteRouter.mountRouter(previewRouter.router());

    registry.setRouter('siteRouter', siteRouter);
    registry.setRouter('previewRouter', previewRouter);

    const dynamicRoutes = settingsService.get('routes');

    _.each(dynamicRoutes.taxonomies, (value, key) => {
        const taxonomyRouter = new TaxonomyRouter(key, value);
        siteRouter.mountRouter(taxonomyRouter.router());

        registry.setRouter(taxonomyRouter.identifier, taxonomyRouter);
    });

    _.each(dynamicRoutes.routes, (value, key) => {
        const staticRoutesRouter = new StaticRoutesRouter(key, value);
        siteRouter.mountRouter(staticRoutesRouter.router());

        registry.setRouter(staticRoutesRouter.identifier, staticRoutesRouter);
    });

    _.each(dynamicRoutes.collections, (value, key) => {
        const collectionRouter = new CollectionRouter(key, value);
        siteRouter.mountRouter(collectionRouter.router());
        registry.setRouter(collectionRouter.identifier, collectionRouter);
    });

    const staticPagesRouter = new StaticPagesRouter();
    siteRouter.mountRouter(staticPagesRouter.router());

    registry.setRouter('staticPagesRouter', staticPagesRouter);

    const appRouter = new ParentRouter('apps');
    siteRouter.mountRouter(appRouter.router());

    registry.setRouter('appRouter', appRouter);

    debug('Routes:', registry.getAllRoutes());
    return siteRouter.router();
};
