import { createDomain, combine } from "effector";
import { Product } from "models";
import { Filter } from "types";
import { defaults } from "lodash";
import produce from "immer";
import api from "api";

const domain = createDomain("product");

// events & effects
const changeFilter = domain.event<Filter>("filter");

const fetchProducts = domain
  .effect<Filter, { count: number; rows: Product[] }, any>("fetch all products")
  .use(filter => {
    return api.products.fetchAll(filter);
  });

const fetchProductDetails = domain
  .effect<number, Product, any>("fetch products details")
  .use(id => {
    return api.products.fetch({ id });
  });

// stores
const $all = domain.store<Product[]>([]);
const $count = domain.store(0);
const $filter = domain.store<Filter>({
  departmentId: -1,
  categoryId: -1,
  page: 1,
  limit: 7,
  search: ""
});
const $busy = domain.store(false);

$filter.on(changeFilter, (state, payload) => payload).watch(newFilter => fetchProducts(newFilter));

// prettier-ignore
$all
  .on(fetchProducts, () => [])
  .on(fetchProducts.done, (state, { result }) => {
    return result.rows
  })
  .on(fetchProductDetails.done, (state, { result: product }) => {
    const ndx = state.findIndex(x => x.id === product.id);

    return produce(state, draft => {
      if (ndx > -1) {
        draft[ndx] = new Product(defaults(product.rawData, draft[ndx].rawData))
      } else {
        draft.push(product)
      }
    });
  })

$count.on(fetchProducts, () => 0).on(fetchProducts.done, (state, { result }) => result.count);

$busy
  .on(fetchProducts, () => true)
  .on(fetchProducts.done, () => false)
  .on(fetchProducts.fail, () => false);

// exports
export default {
  $all,
  $busy,
  $filter,
  $count,
  fetchProducts,
  fetchProductDetails,
  changeFilter
};
