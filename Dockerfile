FROM node:18-alpine

WORKDIR /app

# npm sera exécuté dans le container
# les fichiers seront montés en volume en dev
CMD ["sh"]
