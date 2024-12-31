const fetchBrandData = async (counterpartyName) => {
  try {
      const response = await fetch(`https://api.brandfetch.io/v2/search/${counterpartyName.toString().toLowerCase().split(" ")[0]}`);
      const data = await response.json();
      const avatar = data.find(
          (brand) =>
              brand.name?.toLowerCase() === counterpartyName.toLowerCase() ||
              brand.name?.split('.')[0].toLowerCase() === counterpartyName.toLowerCase(),
      )?.icon;
      return avatar || null; // Return avatar or null if not found
  } catch (error) {
      console.error(`Error fetching brand for ${counterpartyName}:`, error);
      return null; // Return null in case of an error
  }
};


export default fetchBrandData;
