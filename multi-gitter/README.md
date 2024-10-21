# PoC for multi-gitter

PoC for using [multi-gitter](https://github.com/lindell/multi-gitter) to do bulk upgrade over multiple repos

## Steps
1. install multi-gitter as [described in the repo](https://github.com/lindell/multi-gitter?tab=readme-ov-file#install) 
1. update the `config.yml` as you see fit (i.e. to include certain repos)
1. run `multi-gitter run "node $PWD/script.js" --config ./config.yml`