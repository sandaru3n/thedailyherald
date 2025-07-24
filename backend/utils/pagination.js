// Pagination utility for MongoDB queries
const paginate = (query, options) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    populate = [],
    select = null
  } = options;

  const skip = (page - 1) * limit;
  
  return new Promise(async (resolve, reject) => {
    try {
      // Get total count
      const total = await query.model.countDocuments(query._conditions);
      
      // Get paginated results
      let results = query.skip(skip).limit(limit).sort(sort);
      
      // Apply population
      if (populate && populate.length > 0) {
        populate.forEach(pop => {
          results = results.populate(pop);
        });
      }
      
      // Apply field selection
      if (select) {
        results = results.select(select);
      }
      
      const docs = await results.exec();
      
      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      resolve({
        docs,
        totalDocs: total,
        limit,
        page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
        pagingCounter: skip + 1
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { paginate }; 