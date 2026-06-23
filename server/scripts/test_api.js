const http = require('http');

const makeRequest = (headers) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/products',
      method: 'GET',
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: JSON.parse(data)
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

const run = async () => {
  try {
    // Get all stores first
    console.log('Fetching stores...');
    const storesRes = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:5000/api/stores', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { resolve(JSON.parse(data)); });
      }).on('error', reject);
    });

    const stores = storesRes.data;
    console.log(`Found ${stores.length} stores.`);

    for (const store of stores) {
      console.log(`Testing store: ${store.name} (slug: ${store.slug})`);
      const resById = await makeRequest({ 'x-tenant-id': store._id });
      const resBySlug = await makeRequest({ 'x-tenant-slug': store.slug });
      
      const idsById = resById.body.data.map(p => p.store);
      const idsBySlug = resBySlug.body.data.map(p => p.store);
      
      const invalidById = idsById.filter(id => id !== store._id);
      const invalidBySlug = idsBySlug.filter(id => id !== store._id);

      console.log(`  With x-tenant-id: returned ${resById.body.data.length} products. Invalid store associations: ${invalidById.length}`);
      console.log(`  With x-tenant-slug: returned ${resBySlug.body.data.length} products. Invalid store associations: ${invalidBySlug.length}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
