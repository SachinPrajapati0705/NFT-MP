export const getTopCreators = (creators) => {
  const finalCreators = [];

  // Check if creators is defined and is an array
  if (!creators || !Array.isArray(creators) || creators.length === 0) {
    return finalCreators;
  }

  const finalResults = creators.reduce((index, currentValue) => {
    (index[currentValue.seller] = index[currentValue.seller] || []).push(
      currentValue
    );

    return index;
  }, {});

  Object.entries(finalResults).forEach((item) => {
    const seller = item[0];
    const total = item[1]
      .map((newItem) => Number(newItem.price))
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    finalCreators.push({ seller, total });
  });

  return finalCreators;
};
