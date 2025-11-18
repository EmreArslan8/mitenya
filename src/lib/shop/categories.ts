  import { ShopGender, ShopSearchOptions } from '../api/types';

 export interface CategoryNode {
  key: string;
  icon?: string;
  searchOptions?: Partial<ShopSearchOptions>;
  children?: CategoryNode[];
}
const women: CategoryNode = {
  key: 'women',
  icon: 'female',
  children: [
    {
      key: 'clothing',
      searchOptions: {
        gender: '1',
        category: '181',
      },
      children: [
        {
          key: 'dresses',
          searchOptions: {
            gender: '1',
            category: '129',
          },
        },
        {
          key: 'tshirts',
          searchOptions: {
            gender: '1',
            category: '163',
          },
        },
        {
          key: 'shirts',
          searchOptions: {
            category: 'denim-ceket',
          },
        },
        {
          key: 'jeans',
          searchOptions: {
            gender: '1',
            category: '257',
          },
        },
        {
          key: 'denimJackets',
          searchOptions: {
            category: 'denim-ceket',
          },
        },
        {
          key: 'pants',
          searchOptions: {
            gender: '1',
            category: '157',
          },
        },
        {
          key: 'coats',
          searchOptions: {
            gender: '1',
            category: '253',
          },
        },
        {
          key: 'blouses',
          searchOptions: {
            gender: '1',
            category: '2055',
          },
        },
        {
          key: 'jackets',
          searchOptions: {
            gender: '1',
            category: '2077',
          },
        },
        {
          key: 'skirts',
          searchOptions: {
            gender: '1',
            category: '155',
          },
        },
        {
          key: 'sweaters',
          searchOptions: {
            gender: '1',
            category: '2201',
          },
        },
        {
          key: 'tesettur',
          searchOptions: {
            gender: '1',
            category: '179',
          },
        },
        {
          key: 'plusSize',
          searchOptions: {
            gender: '1',
            category: '177',
          },
        },
        {
          key: 'trenchCoats',
          searchOptions: {
            gender: '1',
            category: '175',
          },
        },
        {
          key: 'raincoats',
          searchOptions: {
            gender: '1',
            category: '2427',
          },
        },
        {
          key: 'sweatshirts',
          searchOptions: {
            gender: '1',
            category: '2375',
          },
        },
        {
          key: 'overcoats',
          searchOptions: {
            gender: '1',
            category: '2167',
          },
        },
        {
          key: 'cardigans',
          searchOptions: {
            gender: '1',
            category: '2149',
          },
        },
        {
          key: 'coatsLong',
          searchOptions: {
            gender: '1',
            category: '2277',
          },
        },
      ],
    },
    {
      key: 'shoes',
      searchOptions: {
        gender: '1',
        category: '245',
      },
      children: [
        {
          key: 'heels',
          searchOptions: {
            gender: '1',
            category: '231',
          },
        },
        {
          key: 'sneakers',
          searchOptions: {
            gender: '1',
            category: '2361',
          },
        },
        {
          key: 'casualShoes',
          searchOptions: {
            gender: '1',
            category: '2721',
          },
        },
        {
          key: 'flats',
          searchOptions: {
            gender: '1',
            category: '243',
          },
        },
        {
          key: 'sandals',
          searchOptions: {
            gender: '1',
            category: '239',
          },
        },
        {
          key: 'boots',
          searchOptions: {
            gender: '1',
            category: '2067',
          },
        },
        {
          key: 'kneeBoots',
          searchOptions: {
            gender: '1',
            category: '2091',
          },
        },
        {
          key: 'snowBoots',
          searchOptions: {
            gender: '1',
            category: '285191',
          },
        },
        {
          key: 'loafers',
          searchOptions: {
            gender: '1',
            category: '2233',
          },
        },
      ],
    },
    {
      key: 'bags',
      searchOptions: {
        gender: '1',
        category: '507',
      },
      children: [
        {
          key: 'shoulderBags',
          searchOptions: {
            gender: '1',
            category: '202947',
          },
        },
        {
          key: 'backpacks',
          searchOptions: {
            gender: '1',
            category: '247',
          },
        },
        {
          key: 'beltBags',
          searchOptions: {
            gender: '1',
            category: '208305',
          },
        },
        {
          key: 'schoolBags',
          searchOptions: {
            category: '208425',
          },
        },
        {
          key: 'laptopBags',
          searchOptions: {
            gender: '1',
            category: '2231',
          },
        },
        {
          key: 'clutchBags',
          searchOptions: {
            category: '2319',
          },
        },
        {
          key: 'messengerBags',
          searchOptions: {
            gender: '1',
            category: '2321',
          },
        },
        {
          key: 'handBags',
          searchOptions: {
            category: '208307',
          },
        },
        {
          key: 'canvasBags',
          searchOptions: {
            category: 'kanvas-canta',
          },
        },
        {
          key: 'makeupBags',
          searchOptions: {
            category: '2237',
          },
        },
        {
          key: 'eveningBags',
          searchOptions: {
            gender: '1',
            category: '206181',
          },
        },
        {
          key: 'crossBodyBags',
          searchOptions: {
            category: 'capraz-canta',
          },
        },
        {
          key: 'clothBags',
          searchOptions: {
            category: 'bez-canta',
          },
        },
        {
          key: 'babyBags',
          searchOptions: {
            category: '2045',
          },
        },
        {
          key: 'briefcases',
          searchOptions: {
            category: 'dosya-cantasi',
          },
        },
        {
          key: 'toteBags',
          searchOptions: {
            category: 'tote-canta',
          },
        },
        {
          key: 'lunchBags',
          searchOptions: {
            category: '208097',
          },
        },
        {
          key: 'cardHolders',
          searchOptions: {
            gender: '1',
            category: '2723',
          },
        },
        {
          key: 'wallets',
          searchOptions: {
            gender: '1',
            category: '2081',
          },
        },
        {
          key: 'gymBags',
          searchOptions: {
            gender: '1',
            category: '2365',
          },
        },
      ],
    },
    {
      key: 'underwear',
      searchOptions: {
        gender: '1',
        category: '145',
      },
      children: [
        {
          key: 'pajamaSets',
          searchOptions: {
            gender: '1',
            category: '203009',
          },
        },
        {
          key: 'nightgowns',
          searchOptions: {
            gender: '1',
            category: '141',
          },
        },
        {
          key: 'bras',
          searchOptions: {
            gender: '1',
            category: '143',
          },
        },
        {
          key: 'underwearSets',
          searchOptions: {
            gender: '1',
            category: '209089',
          },
        },
        {
          key: 'fantasyClothing',
          searchOptions: {
            gender: '1',
            category: '218151',
          },
        },
        {
          key: 'socks',
          searchOptions: {
            gender: '1',
            category: '2093',
          },
        },
        {
          key: 'corsets',
          searchOptions: {
            category: '2217',
          },
        },
        {
          key: 'panties',
          searchOptions: {
            category: '2227',
          },
        },
        {
          key: 'bustiers',
          searchOptions: {
            gender: '1',
            category: '165',
          },
        },
        {
          key: 'bralettes',
          searchOptions: {
            category: 'bralet',
          },
        },
        {
          key: 'tankTopsAndBodies',
          searchOptions: {
            gender: '1',
            category: '2025',
          },
        },
        {
          key: 'slips',
          searchOptions: {
            gender: '1',
            category: '2215',
          },
        },
        {
          key: 'garters',
          searchOptions: {
            category: '137',
          },
        },
      ],
    },
    {
      key: 'cosmetics',
      searchOptions: {
        category: '195',
      },
      children: [
        {
          key: 'perfume',
          searchOptions: {
            category: '189',
          },
        },
        {
          key: 'eyeMakeup',
          searchOptions: {
            category: '2711',
          },
        },
        {
          key: 'skincare',
          searchOptions: {
            category: '187',
          },
        },
        {
          key: 'haircare',
          searchOptions: {
            category: '191',
          },
        },
        {
          key: 'makeup',
          searchOptions: {
            category: '217',
          },
        },
        {
          key: 'oralCare',
          searchOptions: {
            category: '202809',
          },
        },
        {
          key: 'sexualHealth',
          searchOptions: {
            category: '202833',
          },
        },
        {
          key: 'bodyCare',
          searchOptions: {
            category: '2425',
          },
        },
        {
          key: 'sanitaryPads',
          searchOptions: {
            category: '202835',
          },
        },
        {
          key: 'showerGelsAndCreams',
          searchOptions: {
            category: '202819',
          },
        },
        {
          key: 'epilationProducts',
          searchOptions: {
            category: '208137',
          },
        },
        {
          key: 'lipsticks',
          searchOptions: {
            category: '2329',
          },
        },
        {
          key: 'lipBalms',
          searchOptions: {
            category: 'dudak-nemlendiricisi',
          },
        },
        {
          key: 'highlighters',
          searchOptions: {
            category: '208051',
          },
        },
        {
          key: 'eyeliner',
          searchOptions: {
            category: '2117',
          },
        },
        {
          key: 'complexionMakeup',
          searchOptions: {
            category: '2713',
          },
        },
        {
          key: 'manicureAndPedicure',
          searchOptions: {
            category: '202805',
          },
        },
        {
          key: 'bbAndCcCream',
          searchOptions: {
            category: '217663',
          },
        },
        {
          key: 'handCreams',
          searchOptions: {
            category: '287543',
          },
        },
        {
          key: 'faceMoisturizers',
          searchOptions: {
            category: '2261',
          },
        },
      ],
    },
    {
      key: 'sportsAndOutdoor',
      searchOptions: {
        category: '209203',
        gender: '1',
      },
      children: [
        {
          key: 'sweatshirts',
          searchOptions: {
            gender: '1',
            category: '202929',
          },
        },
        {
          key: 'tshirts',
          searchOptions: {
            gender: '1',
            category: '202935',
          },
        },
        {
          key: 'sportsBras',
          searchOptions: {
            gender: '1',
            category: '2733',
          },
        },
        {
          key: 'leggings',
          searchOptions: {
            gender: '1',
            category: '202937',
          },
        },
        {
          key: 'tracksuits',
          searchOptions: {
            gender: '1',
            category: '2115',
          },
        },
        {
          key: 'runningShoes',
          searchOptions: {
            gender: '1',
            category: '235',
          },
        },
        {
          key: 'gymBags',
          searchOptions: {
            category: '2365',
          },
        },
        {
          key: 'sportsEquipment',
          searchOptions: {
            category: '208401',
          },
        },
        {
          key: 'outdoorShoes',
          searchOptions: {
            gender: '1',
            category: '2273',
          },
        },
        {
          key: 'snowBoots',
          searchOptions: {
            gender: '1',
            category: '285191',
          },
        },
        {
          key: 'outdoorEquipment',
          searchOptions: {
            category: '208477',
          },
        },
        {
          key: 'sportsSupplements',
          searchOptions: {
            category: '210279',
          },
        },
        {
          key: 'sportsAccessories',
          searchOptions: {
            gender: '1',
            category: '209059',
          },
        },
        {
          key: 'outdoorBags',
          searchOptions: {
            category: '247',
          },
        },
        {
          key: 'skiEquipment',
          searchOptions: {
            category: '291727',
          },
        },
        {
          key: 'sleepingBags',
          searchOptions: {
            category: '208529',
          },
        },
        {
          key: 'mats',
          searchOptions: {
            category: '218607',
          },
        },
        {
          key: 'mountaineering',
          searchOptions: {
            category: '208519',
          },
        },
        {
          key: 'sportsJackets',
          searchOptions: {
            gender: '1',
            category: '202917',
          },
        },
        {
          key: 'sportsShoes',
          searchOptions: {
            gender: '1',
            category: '235',
          },
        },
      ],
    },
    {
      key: 'accessoriesAndBags',
      searchOptions: {
        gender: '1',
        category: '71',
      },
      children: [
        {
          key: 'bags',
          searchOptions: {
            gender: '1',
            category: '251',
          },
        },
        {
          key: 'watches',
          searchOptions: {
            category: 'kadin-saat',
          },
        },
        {
          key: 'jewelry',
          searchOptions: {
            gender: '1',
            category: '73',
          },
        },
        {
          key: 'wallets',
          searchOptions: {
            gender: '1',
            category: '2081',
          },
        },
        {
          key: 'scarves',
          searchOptions: {
            gender: '1',
            category: '2023',
          },
        },
        {
          key: 'beanies',
          searchOptions: {
            gender: '1',
            category: '2047',
          },
        },
        {
          key: 'gloves',
          searchOptions: {
            gender: '1',
            category: '2109',
          },
        },
        {
          key: 'belts',
          searchOptions: {
            gender: '1',
            category: '2203',
          },
        },
        {
          key: 'shawls',
          searchOptions: {
            gender: '1',
            category: '79',
          },
        },
      ],
    },
    {
      key: 'luxury',
      searchOptions: {
        gender: '1',
        xt: 'bu=100161%2C100148&fl=luks-tasarim',
        sort: 'bst',
      },
      children: [
        {
          key: 'luxuryBags',
          searchOptions: {
            gender: '1',
            xt: 'wc=117&bu=100161,100148&fl=luks-tasarim',
            sort: 'bst',
          },
        },
        {
          key: 'luxuryClothing',
          searchOptions: {
            gender: '1',
            xt: 'wc=82&bu=100161,100148&fl=luks-tasarim',
            sort: 'bst',
          },
        },
        {
          key: 'luxuryShoes',
          searchOptions: {
            gender: '1',
            xt: 'wc=114&bu=100161,100148&fl=luks-tasarim',
            sort: 'bst',
          },
        },
      ],
    },
  ],
};

const men: CategoryNode = {
  key: 'men',
  icon: 'male',
  children: [
    {
      key: 'clothing',
      searchOptions: {
        gender: '2',
        category: '181',
      },
      children: [
        {
          key: 'tshirts',
          searchOptions: {
            gender: '2',
            category: '163',
          },
        },
        {
          key: 'shorts',
          searchOptions: {
            gender: '2',
            category: '255',
          },
        },
        {
          key: 'shirts',
          searchOptions: {
            gender: '2',
            category: '167',
          },
        },
        {
          key: 'tracksuits',
          searchOptions: {
            gender: '2',
            category: '2115',
          },
        },
        {
          key: 'pants',
          searchOptions: {
            gender: '2',
            category: '157',
          },
        },
        {
          key: 'jackets',
          searchOptions: {
            gender: '2',
            category: '2077',
          },
        },
        {
          key: 'jeans',
          searchOptions: {
            gender: '2',
            category: '257',
          },
        },
        {
          key: 'vests',
          searchOptions: {
            gender: '2',
            category: '2431',
          },
        },
        {
          key: 'sweaters',
          searchOptions: {
            gender: '2',
            category: '2201',
          },
        },
        {
          key: 'coats',
          searchOptions: {
            gender: '2',
            category: '253',
          },
        },
        {
          key: 'suits',
          searchOptions: {
            gender: '2',
            category: '173',
          },
        },
        {
          key: 'sweatshirts',
          searchOptions: {
            gender: '2',
            category: '2375',
          },
        },
        {
          key: 'leatherCoats',
          searchOptions: {
            category: 'erkek-deri-mont',
          },
        },
        {
          key: 'overcoats',
          searchOptions: {
            gender: '2',
            category: '2167',
          },
        },
        {
          key: 'cardigans',
          searchOptions: {
            gender: '2',
            category: '2149',
          },
        },
        {
          key: 'trenchCoats',
          searchOptions: {
            gender: '2',
            category: '175',
          },
        },
        {
          key: 'coatsLong',
          searchOptions: {
            gender: '2',
            category: '2277',
          },
        },
        {
          key: 'raincoats',
          searchOptions: {
            gender: '2',
            category: '2427',
          },
        },
        {
          key: 'blazers',
          searchOptions: {
            category: 'erkek-blazer-ceket',
          },
        },
        {
          key: 'fleeces',
          searchOptions: {
            gender: '2',
            category: '2315',
          },
        },
      ],
    },
    {
      key: 'shoes',
      searchOptions: {
        gender: '2',
        category: '245',
      },
      children: [
        {
          key: 'sportsShoes',
          searchOptions: {
            gender: '2',
            category: '235',
          },
        },
        {
          key: 'casualShoes',
          searchOptions: {
            gender: '2',
            category: '2721',
          },
        },
        {
          key: 'walkingShoes',
          searchOptions: {
            gender: '2',
            category: '202875',
          },
        },
        {
          key: 'footballBoots',
          searchOptions: {
            category: '289471',
          },
        },
        {
          key: 'sneakers',
          searchOptions: {
            gender: '2',
            category: '2361',
          },
        },
        {
          key: 'classicShoes',
          searchOptions: {
            gender: '2',
            category: '202859',
          },
        },
        {
          key: 'boots',
          searchOptions: {
            gender: '2',
            category: '2067',
          },
        },
        {
          key: 'snowBoots',
          searchOptions: {
            gender: '2',
            category: '285191',
          },
        },
        {
          key: 'leatherShoes',
          searchOptions: {
            category: 'erkek-deri-ayakkabi',
          },
        },
        {
          key: 'loafers',
          searchOptions: {
            gender: '2',
            category: '2233',
          },
        },
        {
          key: 'slippers',
          searchOptions: {
            gender: '2',
            category: '208433',
          },
        },
        {
          key: 'runningShoes',
          searchOptions: {
            gender: '2',
            category: '202869',
          },
        },
        {
          key: 'kneeBoots',
          searchOptions: {
            gender: '2',
            category: '2091',
          },
        },
      ],
    },
    {
      key: 'bags',
      searchOptions: {
        gender: '2',
        category: '251',
      },
      children: [
        {
          key: 'backpacks',
          searchOptions: {
            gender: '2',
            category: '247',
          },
        },
        {
          key: 'gymBags',
          searchOptions: {
            gender: '2',
            category: '2365',
          },
        },
        {
          key: 'laptopBags',
          searchOptions: {
            gender: '2',
            category: '2231',
          },
        },
        {
          key: 'luggage',
          searchOptions: {
            gender: '2',
            category: '2421',
          },
        },
        {
          key: 'messengerBags',
          searchOptions: {
            gender: '2',
            category: '2321',
          },
        },
        {
          key: 'beltBags',
          searchOptions: {
            gender: '2',
            category: '208305',
          },
        },
        {
          key: 'toteBags',
          searchOptions: {
            category: 'bez-canta',
          },
        },
        {
          key: 'briefcases',
          searchOptions: {
            category: 'dosya-cantasi',
          },
        },
        {
          key: 'wallets',
          searchOptions: {
            gender: '2',
            category: '2081',
          },
        },
      ],
    },
    {
      key: 'watchesAndAccessories',
      searchOptions: {
        gender: '2',
        category: '71',
      },
      children: [
        {
          key: 'watches',
          searchOptions: {
            gender: '2',
            category: '85',
          },
        },
        {
          key: 'sunglasses',
          searchOptions: {
            gender: '2',
            category: '227',
          },
        },
        {
          key: 'wallets',
          searchOptions: {
            gender: '2',
            category: '2081',
          },
        },
        {
          key: 'belts',
          searchOptions: {
            gender: '2',
            category: '2203',
          },
        },
        {
          key: 'bags',
          searchOptions: {
            gender: '2',
            category: '251',
          },
        },
        {
          key: 'hats',
          searchOptions: {
            gender: '2',
            category: '2379',
          },
        },
        {
          key: 'cardHolders',
          searchOptions: {
            gender: '2',
            category: '2723',
          },
        },
        {
          key: 'ties',
          searchOptions: {
            category: '2219',
          },
        },
        {
          key: 'neckWarmers',
          searchOptions: {
            gender: '2',
            category: '2069',
          },
        },
        {
          key: 'scarves',
          searchOptions: {
            gender: '2',
            category: '2023',
          },
        },
        {
          key: 'beanies',
          searchOptions: {
            gender: '2',
            category: '2047',
          },
        },
        {
          key: 'gloves',
          searchOptions: {
            gender: '2',
            category: '2109',
          },
        },
      ],
    },
    {
      key: 'sportsAndOutdoor',
      searchOptions: {
        category: '209203',
      },
      children: [
        {
          key: 'tracksuits',
          searchOptions: {
            gender: '2',
            category: '2115',
          },
        },
        {
          key: 'sportsShoes',
          searchOptions: {
            gender: '2',
            category: '235',
          },
        },
        {
          key: 'tshirts',
          searchOptions: {
            gender: '2',
            category: '202935',
          },
        },
        {
          key: 'sweatshirts',
          searchOptions: {
            gender: '2',
            category: '202929',
          },
        },
        {
          key: 'jerseys',
          searchOptions: {
            category: '2125',
          },
        },
        {
          key: 'sportsSocks',
          searchOptions: {
            gender: '2',
            category: '218087',
          },
        },
        {
          key: 'sportsClothing',
          searchOptions: {
            gender: '2',
            category: '202911',
          },
        },
        {
          key: 'outdoorShoes',
          searchOptions: {
            gender: '2',
            category: '2273',
          },
        },
        {
          key: 'outdoorBoots',
          searchOptions: {
            gender: '2',
            category: '2067',
          },
        },
        {
          key: 'sportsEquipment',
          searchOptions: {
            category: '208401',
          },
        },
        {
          key: 'outdoorEquipment',
          searchOptions: {
            category: '208477',
          },
        },
        {
          key: 'sportsSupplements',
          searchOptions: {
            category: '210279',
          },
        },
        {
          key: 'sportsAccessories',
          searchOptions: {
            category: '209059',
          },
        },
        {
          key: 'sneakers',
          searchOptions: {
            gender: '2',
            category: '2361',
          },
        },
        {
          key: 'scooters',
          searchOptions: {
            category: '209083',
          },
        },
        {
          key: 'bicycles',
          searchOptions: {
            category: '209177',
          },
        },
        {
          key: 'divingEquipment',
          searchOptions: {
            category: '208493',
          },
        },
        {
          key: 'windbreakers',
          searchOptions: {
            gender: '2',
            category: '2427',
          },
        },
        {
          key: 'actionCameras',
          searchOptions: {
            category: '208507',
          },
        },
        {
          key: 'campingEquipment',
          searchOptions: {
            category: '208517',
          },
        },
      ],
    },
    {
      key: 'electronics',
      searchOptions: {
        category: '208065',
      },
      children: [
        {
          key: 'shavers',
          searchOptions: {
            category: '204771',
          },
        },
        {
          key: 'mobilePhones',
          searchOptions: {
            category: '207013',
          },
        },
        {
          key: 'smartWatches',
          searchOptions: {
            category: '2497',
          },
        },
        {
          key: 'smartBracelets',
          searchOptions: {
            category: '206239',
          },
        },
        {
          key: 'laptops',
          searchOptions: {
            category: '206233',
          },
        },
        {
          key: 'gamingConsoles',
          searchOptions: {
            category: '208105',
          },
        },
        {
          key: 'electricBicycles',
          searchOptions: {
            category: '220715',
          },
        },
        {
          key: 'epinAndWalletCodes',
          searchOptions: {
            category: '218135',
          },
        },
        {
          key: 'playstation5',
          searchOptions: {
            category: '288109',
          },
        },
        {
          key: 'giftCards',
          searchOptions: {
            category: '218137',
          },
        },
        {
          key: 'bluetoothHeadphones',
          searchOptions: {
            category: '217269',
          },
        },
        {
          key: 'gamingPC',
          searchOptions: {
            category: '212197',
          },
        },
        {
          key: 'gamingChairs',
          searchOptions: {
            category: '212683',
          },
        },
        {
          key: 'xboxSeriesX',
          searchOptions: {
            category: '25735',
          },
        },
        {
          key: 'drones',
          searchOptions: {
            category: '217879',
          },
        },
      ],
    },
    {
      key: 'personalCare',
      searchOptions: {
        category: '195',
      },
      children: [
        {
          key: 'perfume',
          searchOptions: {
            gender: '2',
            category: '189',
          },
        },
        {
          key: 'sexualHealth',
          searchOptions: {
            category: '202833',
          },
        },
        {
          key: 'afterShaveProducts',
          searchOptions: {
            gender: '2',
            category: '202829',
          },
        },
        {
          key: 'razorBlades',
          searchOptions: {
            category: '202825',
          },
        },
        {
          key: 'deodorant',
          searchOptions: {
            gender: '2',
            category: '2097',
          },
        },
      ],
    },
    {
      key: 'plusSize',
      searchOptions: {
        gender: '2',
        category: '177',
      },
      children: [
        {
          key: 'plusSizeSweatshirts',
          searchOptions: {
            gender: '2',
            category: '217731',
          },
        },
        {
          key: 'plusSizeTshirts',
          searchOptions: {
            gender: '2',
            category: '205571',
          },
        },
        {
          key: 'plusSizeShirts',
          searchOptions: {
            gender: '2',
            category: '217727',
          },
        },
        {
          key: 'plusSizePants',
          searchOptions: {
            gender: '2',
            category: '205575',
          },
        },
        {
          key: 'plusSizeCoats',
          searchOptions: {
            gender: '2',
            category: '217745',
          },
        },
        {
          key: 'plusSizeSweaters',
          searchOptions: {
            gender: '2',
            category: '217749',
          },
        },
        {
          key: 'plusSizeCardigans',
          searchOptions: {
            gender: '2',
            category: '217747',
          },
        },
        {
          key: 'plusSizeOvercoats',
          searchOptions: {
            gender: '2',
            category: '217743',
          },
        },
        {
          key: 'plusSizeTracksuits',
          searchOptions: {
            gender: '2',
            category: '217741',
          },
        },
      ],
    },
    {
      key: 'underwear',
      searchOptions: {
        gender: '2',
        category: '145',
      },
      children: [
        {
          key: 'boxers',
          searchOptions: {
            gender: '2',
            category: '139',
          },
        },
        {
          key: 'socks',
          searchOptions: {
            gender: '2',
            category: '2093',
          },
        },
        {
          key: 'pajamas',
          searchOptions: {
            gender: '2',
            category: '2303',
          },
        },
        {
          key: 'tankTops',
          searchOptions: {
            gender: '2',
            category: '2025',
          },
        },
        {
          key: 'thermalUnderwear',
          searchOptions: {
            gender: '2',
            category: '207443',
          },
        },
      ],
    },
    {
      key: 'luxuryAndDesigner',
      searchOptions: {
        gender: '2',
        xt: 'bu=100161%2C100148&fl=luks-tasarim',
        sort: 'bst',
      },
      children: [
        {
          key: 'luxuryClothing',
          searchOptions: {
            gender: '2',
            xt: 'wc=82&bu=100161%2C100148&fl=luks-tasarim',
            sort: 'bst',
          },
        },
        {
          key: 'luxuryShoes',
          searchOptions: {
            gender: '2',
            xt: 'wc=114&bu=100161%2C100148&fl=luks-tasarim',
            sort: 'bst',
          },
        },
        {
          key: 'luxuryBags',
          searchOptions: {
            gender: '2',
            xt: 'wc=117&bu=100161%2C100148&fl=luks-tasarim',
            // category: '2421, 2321, 247, 202947, 208305, 208307, 2365',
            sort: 'bst',
            // brand: "683, 683, 125, 210883, 293, 285261"
          },
        },
      ],
    },
  ],
};
const kids: CategoryNode = {
  key: 'momAndKids',
  icon: 'child_care',
  children: [
    {
      key: 'baby',
      searchOptions: {
        category: '208333',
      },
      children: [
        {
          key: 'babySets',
          searchOptions: {
            category: '207471',
          },
        },
        {
          key: 'firstStepShoes',
          searchOptions: {
            category: 'ilk-adim-ayakkabisi',
          },
        },
        {
          key: 'hospitalOutfits',
          searchOptions: {
            category: '208335',
          },
        },
        {
          key: 'newbornClothing',
          searchOptions: {
            category: 'yenidogan-bebek-kiyafetleri',
          },
        },
        {
          key: 'rompers',
          searchOptions: {
            category: 'bebek-tulum',
          },
        },
        {
          key: 'bodysuits',
          searchOptions: {
            category: '209149',
          },
        },
        {
          key: 'tshirtsAndTankTops',
          searchOptions: {
            category: 'cocuk-t-shirt',
            gender: '6,7' as ShopGender,
          },
        },
        {
          key: 'dresses',
          searchOptions: {
            category: 'kiz-bebek-elbise',
          },
        },
        {
          key: 'shorts',
          searchOptions: {
            category: 'bebek-sort',
          },
        },
        {
          key: 'booties',
          searchOptions: {
            category: 'bebek-patigi',
          },
        },
        {
          key: 'cardigans',
          searchOptions: {
            category: '2149',
            gender: '3',
          },
        },
        {
          key: 'blankets',
          searchOptions: {
            category: '211179',
          },
        },
        {
          key: 'topAndBottomSets',
          searchOptions: {
            category: '207471',
          },
        },
        {
          key: 'tshirts',
          searchOptions: {
            category: 'bebek-tisort',
          },
        },
        {
          key: 'skirts',
          searchOptions: {
            category: 'bebek-etek',
          },
        },
        {
          key: 'socks',
          searchOptions: {
            category: 'bebek-corabi',
          },
        },
        {
          key: 'hats',
          searchOptions: {
            category: 'bebek-sapkasi',
          },
        },
        {
          key: 'gloves',
          searchOptions: {
            category: 'bebek-eldiveni',
          },
        },
        {
          key: 'tracksuits',
          searchOptions: {
            category: 'bebek-esofman-takimi',
          },
        },
        {
          key: 'beanies',
          searchOptions: {
            category: '2047',
            gender: '3',
          },
        },
      ],
    },
    {
      key: 'girls',
      searchOptions: {
        category: 'cocuk-giyim',
        gender: '4',
      },
      children: [
        {
          key: 'dresses',
          searchOptions: {
            category: '129',
            gender: '3',
          },
        },
        {
          key: 'sweatshirts',
          searchOptions: {
            category: 'cocuk-sweatshirt',
            gender: '4',
          },
        },
        {
          key: 'sportsShoes',
          searchOptions: {
            category: 'cocuk-spor-ayakkabi',
            gender: '4',
          },
        },
        {
          key: 'tracksuits',
          searchOptions: {
            category: 'cocuk-esofman',
            gender: '4',
          },
        },
        {
          key: 'underwearAndPajamas',
          searchOptions: {
            category: 'cocuk-ic-giyim',
            gender: '4',
          },
        },
        {
          key: 'tshirtsAndTankTops',
          searchOptions: {
            category: 'cocuk-t-shirt',
            gender: '4',
          },
        },
        {
          key: 'leggings',
          searchOptions: {
            category: '259',
            gender: '3',
          },
        },
        {
          key: 'casualShoes',
          searchOptions: {
            category: 'cocuk-gunluk-ayakkabi',
            gender: '4',
          },
        },
        {
          key: 'shorts',
          searchOptions: {
            category: 'cocuk-sort',
            gender: '4',
          },
        },
        {
          key: 'coats',
          searchOptions: {
            category: '253',
            gender: '3',
          },
        },
        {
          key: 'playHouses',
          searchOptions: {
            category: 'cocuk-oyun-evi',
          },
        },
        {
          key: 'dolls',
          searchOptions: {
            category: '207439',
          },
        },
        {
          key: 'toyKitchens',
          searchOptions: {
            category: 'oyuncak-mutfak',
          },
        },
        {
          key: 'overcoats',
          searchOptions: {
            category: '2167',
            gender: '3',
          },
        },
        {
          key: 'occasionDresses',
          searchOptions: {
            category: '127',
            gender: '3',
          },
        },
        {
          key: 'jackets',
          searchOptions: {
            category: '2077',
            gender: '3',
          },
        },
        {
          key: 'pants',
          searchOptions: {
            category: '157',
            gender: '3',
          },
        },
        {
          key: 'sweaters',
          searchOptions: {
            category: '2201',
            gender: '3',
          },
        },
        {
          key: 'boots',
          searchOptions: {
            category: '2067',
            gender: '3',
          },
        },
        {
          key: 'hatsScarvesGloves',
          searchOptions: {
            category: '203015',
            gender: '3',
          },
        },
      ],
    },
    {
      key: 'boys',
      searchOptions: {
        category: '161',
      },
      children: [
        {
          key: 'sweatshirts',
          searchOptions: {
            category: 'cocuk-sweatshirt',
            gender: '5',
          },
        },
        {
          key: 'sportsShoes',
          searchOptions: {
            category: 'cocuk-spor-ayakkabi',
            gender: '5',
          },
        },
        {
          key: 'tracksuits',
          searchOptions: {
            category: 'cocuk-esofman',
            gender: '5',
          },
        },
        {
          key: 'underwearAndPajamas',
          searchOptions: {
            category: 'cocuk-ic-giyim',
            gender: '5',
          },
        },
        {
          key: 'tshirtsAndTankTops',
          searchOptions: {
            category: 'cocuk-t-shirt',
            gender: '5',
          },
        },
        {
          key: 'casualShoes',
          searchOptions: {
            category: 'cocuk-gunluk-ayakkabi',
            gender: '5',
          },
        },
        {
          key: 'schoolBags',
          searchOptions: {
            category: 'cocuk-okul-cantasi',
            gender: '5',
          },
        },
        {
          key: 'shorts',
          searchOptions: {
            category: 'cocuk-sort',
            gender: '5',
          },
        },
        {
          key: 'shirts',
          searchOptions: {
            category: 'cocuk-gomlek',
            gender: '5',
          },
        },
        {
          key: 'coats',
          searchOptions: {
            category: '253',
            gender: '3',
          },
        },
        {
          key: 'toyTractors',
          searchOptions: {
            category: 'oyuncak-traktor',
          },
        },
        {
          key: 'batteryCars',
          searchOptions: {
            category: '207395',
          },
        },
        {
          key: 'rcCars',
          searchOptions: {
            category: 'uzaktan-kumandali-araba',
          },
        },
        {
          key: 'bicycles',
          searchOptions: {
            category: '209075',
          },
        },
        {
          key: 'boxers',
          searchOptions: {
            category: '139',
            gender: '3',
          },
        },
        {
          key: 'thermalUnderwear',
          searchOptions: {
            category: '207443',
            gender: '3',
          },
        },
        {
          key: 'boots',
          searchOptions: {
            category: '2067',
            gender: '3',
          },
        },
        {
          key: 'footballBoots',
          searchOptions: {
            category: '289471',
            gender: '3',
          },
        },
        {
          key: 'hatsScarvesGloves',
          searchOptions: {
            category: '203015',
            gender: '3',
          },
        },
        {
          key: 'suits',
          searchOptions: {
            category: '173',
            gender: '3',
          },
        },
      ],
    },
    {
      key: 'babyCare',
      searchOptions: {
        category: '202845',
      },
      children: [
        {
          key: 'diapers',
          searchOptions: {
            category: '2743',
          },
        },
        {
          key: 'babyShampoo',
          searchOptions: {
            category: '211141',
          },
        },
        {
          key: 'creamsAndOils',
          searchOptions: {
            category: '207555',
          },
        },
        {
          key: 'babyBags',
          searchOptions: {
            category: '2045',
          },
        },
        {
          key: 'babySoap',
          searchOptions: {
            category: '211139',
          },
        },
        {
          key: 'babyDetergent',
          searchOptions: {
            category: '218225',
          },
        },
        {
          key: 'babyBodyCream',
          searchOptions: {
            category: '207555',
          },
        },
        {
          key: 'wetWipes',
          searchOptions: {
            category: '202839',
          },
        },
        {
          key: 'babyComb',
          searchOptions: {
            category: '207559',
            gender: '3',
          },
        },
        {
          key: 'babyOil',
          searchOptions: {
            category: 'bebe-yagi',
          },
        },
        {
          key: 'babyHumidifier',
          searchOptions: {
            category: 'bebek-buhar-makinesi',
          },
        },
        {
          key: 'babyThermometer',
          searchOptions: {
            category: '289725',
          },
        },
      ],
    },
    {
      key: 'feedingAndNursing',
      searchOptions: {
        category: '207521',
      },
      children: [
        {
          key: 'bottlesAndPacifiers',
          searchOptions: {
            category: '207527',
          },
        },
        {
          key: 'breastPumps',
          searchOptions: {
            category: '207537',
          },
        },
        {
          key: 'highChairs',
          searchOptions: {
            category: '2239',
          },
        },
        {
          key: 'bib',
          searchOptions: {
            category: '207547',
          },
        },
        {
          key: 'trainingCups',
          searchOptions: {
            category: '207529',
          },
        },
        {
          key: 'bottleCleaners',
          searchOptions: {
            category: '285145',
          },
        },
        {
          key: 'bottleSets',
          searchOptions: {
            category: 'biberon-seti',
          },
        },
        {
          key: 'babyFormula',
          searchOptions: {
            category: '207523',
          },
        },
        {
          key: 'jarFood',
          searchOptions: {
            category: '210983',
          },
        },
        {
          key: 'sterilizers',
          searchOptions: {
            category: '207531',
          },
        },
        {
          key: 'babyCareBags',
          searchOptions: {
            category: '2045',
          },
        },
        {
          key: 'dinnerSets',
          searchOptions: {
            category: '207549',
          },
        },
        {
          key: 'spoonFeeding',
          searchOptions: {
            category: '210981',
          },
        },
        {
          key: 'steamCookers',
          searchOptions: {
            category: 'buharli-pisirici',
          },
        },
        {
          key: 'thermalBags',
          searchOptions: {
            category: '292533',
          },
        },
        {
          key: 'breastPumps',
          searchOptions: {
            category: '207537',
          },
        },
        {
          key: 'nursingCover',
          searchOptions: {
            category: 'emzirme-onlugu',
          },
        },
        {
          key: 'nursingPillow',
          searchOptions: {
            category: '207545',
          },
        },
        {
          key: 'nursingPads',
          searchOptions: {
            category: '207535',
          },
        },
        {
          key: 'nippleCreams',
          searchOptions: {
            category: '207577',
          },
        },
      ],
    },
    {
      key: 'transportAndSafety',
      searchOptions: {
        category: '2727',
      },
      children: [
        {
          key: 'babyStrollers',
          searchOptions: {
            category: '207487',
          },
        },
        {
          key: 'playpens',
          searchOptions: {
            category: '207437',
          },
        },
        {
          key: 'infantCarriers',
          searchOptions: {
            category: '207479',
          },
        },
        {
          key: 'babyCarriers',
          searchOptions: {
            category: '207497',
          },
        },
        {
          key: 'babyWalkers',
          searchOptions: {
            category: '207499',
          },
        },
        {
          key: 'carSeats',
          searchOptions: {
            category: '207493',
          },
        },
        {
          key: 'umbrellaStrollers',
          searchOptions: {
            category: 'baston-bebek-arabasi',
          },
        },
        {
          key: 'babyCarriers',
          searchOptions: {
            category: '207497',
          },
        },
        {
          key: 'babySwings',
          searchOptions: {
            category: '209037',
          },
        },
      ],
    },
    {
      key: 'toys',
      searchOptions: {
        category: '197',
      },
      children: [
        {
          key: 'educationalToys',
          searchOptions: {
            category: '290353',
          },
        },
        {
          key: 'toyCars',
          searchOptions: {
            category: '288095',
          },
        },
        {
          key: 'dolls',
          searchOptions: {
            category: '207439',
          },
        },
        {
          key: 'babyAndPreschoolToys',
          searchOptions: {
            category: '207401',
          },
        },
        {
          key: 'remoteControlToys',
          searchOptions: {
            category: '207655',
          },
        },
        {
          key: 'robotToys',
          searchOptions: {
            category: 'robot-oyuncak',
          },
        },
      ],
    },
    {
      key: 'nursery',
      searchOptions: {
        category: '210667',
      },
      children: [
        {
          key: 'babyCribs',
          searchOptions: {
            category: '209039',
          },
        },
        {
          key: 'babyBeds',
          searchOptions: {
            category: '288753',
          },
        },
        {
          key: 'babyBeddings',
          searchOptions: {
            category: '211183',
          },
        },
        {
          key: 'toyBaskets',
          searchOptions: {
            category: 'oyuncak-sepet',
          },
        },
        {
          key: 'babyCanopies',
          searchOptions: {
            category: '210995',
          },
        },
        {
          key: 'toyCabinets',
          searchOptions: {
            category: '302467',
          },
        },
        {
          key: 'nurseryFurniture',
          searchOptions: {
            category: '210667',
          },
        },
        {
          key: 'babyPlayMats',
          searchOptions: {
            category: 'oyun-mati',
          },
        },
        {
          key: 'playpens',
          searchOptions: {
            category: '207437',
          },
        },
      ],
    },
  ],
};
const shoesAndBags: CategoryNode = {
  key: 'shoesAndBags',
  icon: 'local_mall',
  children: [
    {
      key: 'womenShoes',
      searchOptions: {
        gender: '1',
        category: '245',
      },
      children: [
        {
          key: 'sportsShoes',
          searchOptions: {
            gender: '1',
            category: '235',
          },
        },
        {
          key: 'heels',
          searchOptions: {
            gender: '1',
            category: '231',
          },
        },
        {
          key: 'casualShoes',
          searchOptions: {
            gender: '1',
            category: '2721',
          },
        },
        {
          key: 'bootsAndBooties',
          searchOptions: {
            gender: '1',
            category: '2067',
          },
        },
        {
          key: 'sandals',
          searchOptions: {
            gender: '1',
            category: '239',
          },
        },
        {
          key: 'slippers',
          searchOptions: {
            gender: '1',
            category: '237',
          },
        },
        {
          key: 'sneakers',
          searchOptions: {
            gender: '1',
            category: '2361',
          },
        },
        {
          key: 'balletFlats',
          searchOptions: {
            gender: '1',
            category: '243',
          },
        },
        {
          key: 'loafers',
          searchOptions: {
            gender: '1',
            category: '2233',
          },
        },
        {
          key: 'momShoes',
          searchOptions: {
            category: 'anne-ayakkabisi',
          },
        },
        {
          key: 'embellishedSandals',
          searchOptions: {
            category: 'tasli-sandalet',
          },
        },
        {
          key: 'hospitalSlippers',
          searchOptions: {
            category: 'hastane-terlikleri',
          },
        },
        {
          key: 'heeledSlippers',
          searchOptions: {
            category: 'kalin-topuklu-terlik',
          },
        },
        {
          key: 'heeledBoots',
          searchOptions: {
            category: 'kalin-topuklu-bot',
          },
        },
        {
          key: 'kneeHighBoots',
          searchOptions: {
            gender: '1',
            category: '2091',
          },
        },
        {
          key: 'cowboyBoots',
          searchOptions: {
            category: 'kovboy-cizmesi',
          },
        },
        {
          key: 'wedgeHeels',
          searchOptions: {
            category: '229',
          },
        },
        {
          key: 'snowBoots',
          searchOptions: {
            gender: '1',
            category: '285191',
          },
        },
        {
          key: 'rainBoots',
          searchOptions: {
            category: 'yagmur-botu',
          },
        },
        {
          key: 'pandaSlippers',
          searchOptions: {
            gender: '1',
            category: '2281',
          },
        },
      ],
    },
    {
      key: 'menShoes',
      searchOptions: {
        gender: '2',
        category: '245',
      },
      children: [
        {
          key: 'sportsShoes',
          searchOptions: {
            gender: '2',
            category: '235',
          },
        },
        {
          key: 'casualShoes',
          searchOptions: {
            gender: '2',
            category: '2721',
          },
        },
        {
          key: 'classicShoes',
          searchOptions: {
            gender: '2',
            category: '202859',
          },
        },
        {
          key: 'sneakers',
          searchOptions: {
            gender: '2',
            category: '2361',
          },
        },
        {
          key: 'runningShoes',
          searchOptions: {
            gender: '2',
            category: '202869',
          },
        },
        {
          key: 'footballBoots',
          searchOptions: {
            category: '289471',
          },
        },
        {
          key: 'loafers',
          searchOptions: {
            gender: '2',
            category: '2233',
          },
        },
        {
          key: 'indoorSoccerShoes',
          searchOptions: {
            category: '2131',
          },
        },
        {
          key: 'sandals',
          searchOptions: {
            gender: '2',
            category: '239',
          },
        },
        {
          key: 'boots',
          searchOptions: {
            gender: '2',
            category: '2067',
          },
        },
        {
          key: 'kneeHighBoots',
          searchOptions: {
            gender: '2',
            category: '2091',
          },
        },
        {
          key: 'combatBoots',
          searchOptions: {
            category: 'erkek-postal-bot',
          },
        },
        {
          key: 'basketballShoes',
          searchOptions: {
            category: '202861',
          },
        },
        {
          key: 'slippers',
          searchOptions: {
            gender: '2',
            category: '237',
          },
        },
        {
          key: 'homeSlippers',
          searchOptions: {
            gender: '2',
            category: '208433',
          },
        },
        {
          key: 'pandaSlippers',
          searchOptions: {
            gender: '2',
            category: '2281',
          },
        },
        {
          key: 'waterShoes',
          searchOptions: {
            gender: '2',
            category: '207391',
          },
        },
        {
          key: 'suedeShoes',
          searchOptions: {
            category: 'suet-ayakkabı',
          },
        },
        {
          key: 'walkingShoes',
          searchOptions: {
            gender: '2',
            category: '202875',
          },
        },
      ],
    },
    {
      key: 'childrenShoes',
      searchOptions: {
        gender: '3',
        category: '245',
      },
      children: [
        {
          key: 'sportsShoes',
          searchOptions: {
            gender: '3',
            category: '235',
          },
        },
        {
          key: 'casualShoes',
          searchOptions: {
            gender: '3',
            category: '2721',
          },
        },
        {
          key: 'balletFlats',
          searchOptions: {
            gender: '3',
            category: '243',
          },
        },
        {
          key: 'boots',
          searchOptions: {
            gender: '3',
            category: '2067',
          },
        },
        {
          key: 'sneakers',
          searchOptions: {
            gender: '3',
            category: '2361',
          },
        },
        {
          key: 'sandals',
          searchOptions: {
            gender: '3',
            category: '239',
          },
        },
        {
          key: 'slippers',
          searchOptions: {
            gender: '3',
            category: '237',
          },
        },
        {
          key: 'pandaSlippers',
          searchOptions: {
            gender: '3',
            category: '2281',
          },
        },
        {
          key: 'kneeHighBoots',
          searchOptions: {
            gender: '3',
            category: '2091',
          },
        },
        {
          key: 'basketballShoes',
          searchOptions: {
            gender: '3',
            category: '202861',
          },
        },
        {
          key: 'footballBoots',
          searchOptions: {
            gender: '3',
            category: '289471',
          },
        },
      ],
    },
    {
      key: 'menAccessories',
      searchOptions: {
        gender: '2',
        category: '71',
      },
      children: [
        {
          key: 'watches',
          searchOptions: {
            gender: '2',
            category: '85',
          },
        },
        {
          key: 'sunglasses',
          searchOptions: {
            gender: '2',
            category: '227',
          },
        },
        {
          key: 'wallets',
          searchOptions: {
            gender: '2',
            category: '2081',
          },
        },
        {
          key: 'belts',
          searchOptions: {
            gender: '2',
            category: '2203',
          },
        },
        {
          key: 'hats',
          searchOptions: {
            gender: '2',
            category: '2379',
          },
        },
        {
          key: 'bracelets',
          searchOptions: {
            gender: '2',
            category: '219',
          },
        },
        {
          key: 'ties',
          searchOptions: {
            category: '2219',
          },
        },
        {
          key: 'necklaces',
          searchOptions: {
            category: '302949',
          },
        },
        {
          key: 'pins',
          searchOptions: {
            category: '302949',
          },
        },
        {
          key: 'bowties',
          searchOptions: {
            category: '2283',
          },
        },
      ],
    },
    {
      key: 'womenBags',
      searchOptions: {
        gender: '1',
        category: '251',
      },
      children: [
        {
          key: 'shoulderBags',
          searchOptions: {
            gender: '1',
            category: '202947',
          },
        },
        {
          key: 'backpacks',
          searchOptions: {
            gender: '1',
            category: '247',
          },
        },
        {
          key: 'wallets',
          searchOptions: {
            gender: '1',
            category: '2081',
          },
        },
        {
          key: 'gymBags',
          searchOptions: {
            gender: '1',
            category: '2365',
          },
        },
        {
          key: 'beltBags',
          searchOptions: {
            gender: '1',
            category: '208305',
          },
        },
        {
          key: 'handBags',
          searchOptions: {
            gender: '1',
            category: '208307',
          },
        },
        {
          key: 'clutchBags',
          searchOptions: {
            gender: '1',
            category: '2319',
          },
        },
        {
          key: 'canvasBags',
          searchOptions: {
            category: 'bez-canta',
          },
        },
        {
          key: 'cardHolders',
          searchOptions: {
            gender: '1',
            category: '2191',
          },
        },
        {
          key: 'eveningBags',
          searchOptions: {
            gender: '1',
            category: '206181',
          },
        },
        {
          key: 'messengerBags',
          searchOptions: {
            gender: '1',
            category: '2321',
          },
        },
        {
          key: 'beachBags',
          searchOptions: {
            gender: '1',
            category: '2311',
          },
        },
        {
          key: 'laptopBags',
          searchOptions: {
            gender: '1',
            category: '2231',
          },
        },
        {
          key: 'quiltedBags',
          searchOptions: {
            category: 'kapitone-canta',
          },
        },
        {
          key: 'documentBags',
          searchOptions: {
            category: 'dosya-cantasi',
          },
        },
        {
          key: 'boxBags',
          searchOptions: {
            category: 'kutu-canta',
          },
        },
        {
          key: 'makeupBags',
          searchOptions: {
            category: '2237',
          },
        },
        {
          key: 'plushBags',
          searchOptions: {
            category: 'pelus-canta',
          },
        },
        {
          key: 'strawBags',
          searchOptions: {
            category: 'hasir-canta',
          },
        },
        {
          key: 'luggage',
          searchOptions: {
            gender: '1',
            category: '2421',
          },
        },
      ],
    },
    {
      key: 'menBags',
      searchOptions: {
        gender: '2',
        category: '251',
      },
      children: [
        {
          key: 'backpacks',
          searchOptions: {
            gender: '2',
            category: '247',
          },
        },
        {
          key: 'messengerBags',
          searchOptions: {
            gender: '2',
            category: '2321',
          },
        },
        {
          key: 'walletsAndCardHolders',
          searchOptions: {
            gender: '2',
            category: '2723',
          },
        },
        {
          key: 'gymBags',
          searchOptions: {
            gender: '2',
            category: '2365',
          },
        },
        {
          key: 'laptopBags',
          searchOptions: {
            gender: '2',
            category: '2231',
          },
        },
        {
          key: 'beltBags',
          searchOptions: {
            gender: '2',
            category: '208305',
          },
        },
        {
          key: 'shoulderBags',
          searchOptions: {
            gender: '2',
            category: '202947',
          },
        },
        {
          key: 'clutchBags',
          searchOptions: {
            gender: '2',
            category: '2319',
          },
        },
        {
          key: 'shavingBags',
          searchOptions: {
            category: 'tiras-cantasi',
          },
        },
        {
          key: 'fishingBags',
          searchOptions: {
            category: 'olta-cantasi',
          },
        },
        {
          key: 'schoolBags',
          searchOptions: {
            gender: '2',
            category: '208425',
          },
        },
        {
          key: 'luggage',
          searchOptions: {
            gender: '2',
            category: '2421',
          },
        },
        {
          key: 'outdoorBags',
          searchOptions: {
            category: 'outdoor-canta',
          },
        },
        {
          key: 'handBags',
          searchOptions: {
            gender: '2',
            category: '208307',
          },
        },
      ],
    },

    {
      key: 'childrenBags',
      searchOptions: {
        gender: '3',
        category: '251',
      },
      children: [
        {
          key: 'backpacks',
          searchOptions: {
            gender: '3',
            category: '247',
          },
        },
        {
          key: 'schoolBags',
          searchOptions: {
            gender: '3',
            category: '208425',
          },
        },
        {
          key: 'trolleyBags',
          searchOptions: {
            category: 'cekcekli-canta',
          },
        },
        {
          key: 'lunchBags',
          searchOptions: {
            gender: '3',
            category: '208097',
          },
        },
        {
          key: 'licensedBags',
          searchOptions: {
            category: 'lisansli-okul-cantasi',
          },
        },
        {
          key: 'beltBags',
          searchOptions: {
            gender: '3',
            category: '208305',
          },
        },
        {
          key: 'messengerBags',
          searchOptions: {
            gender: '3',
            category: '2321',
          },
        },
      ],
    },
    {
      key: 'womenAccessories',
      searchOptions: {
        gender: '1',
        category: '71',
      },
      children: [
        {
          key: 'watches',
          searchOptions: {
            gender: '1',
            category: '85',
          },
        },
        {
          key: 'jewelry',
          searchOptions: {
            gender: '1',
            category: '73',
          },
        },
        {
          key: 'hats',
          searchOptions: {
            gender: '1',
            category: '2379',
          },
        },
        {
          key: 'sunglasses',
          searchOptions: {
            category: '227',
          },
        },
        {
          key: 'hairAccessories',
          searchOptions: {
            gender: '1',
            category: '202885',
          },
        },
        {
          key: 'belts',
          searchOptions: {
            gender: '1',
            category: '2203',
          },
        },
        {
          key: 'silverNecklaces',
          searchOptions: {
            category: '207113',
          },
        },
        {
          key: 'strawBracelets',
          searchOptions: {
            category: 'hasir-bilezik',
          },
        },
      ],
    },
    {
      key: 'luxuryAndDesigner',
      searchOptions: {
        xt: 'wc=117%2C114&bu=100161%2C100148&fl=luks-tasarim',
        sort: 'bst',
      },
      children: [
        {
          key: 'luxuryBags',
          searchOptions: {
            xt: 'wg=2%2C1&wc=117&bu=100161%2C100148&fl=luks-tasarim',
            sort: 'bst',
          },
        },
        {
          key: 'luxuryShoes',
          searchOptions: {
            xt: 'wg=2%2C1&wc=114&bu=100161%2C100148&fl=luks-tasarim',
            sort: 'bst',
          },
        },
      ],
    },
  ],
};
const sportsAndOutdoor: CategoryNode = {
  key: 'sportsAndOutdoor',
  icon: 'directions_run',
  children: [
    {
      key: 'sportsUpperWear',
      searchOptions: { category: '202911' },
      children: [
        { key: 'sportsTShirt', searchOptions: { category: '202935' } },
        { key: 'jacketsAndVests', searchOptions: { category: '202939' } },
        { key: 'raincoats', searchOptions: { category: '2427' } },
        { key: 'sportsBra', searchOptions: { gender: '1', category: '2733' } },
        { key: 'sweatshirt', searchOptions: { category: '202929' } },
        { key: 'tankTop', searchOptions: { category: '202913' } },
        { key: 'jersey', searchOptions: { category: '2125' } },
        { key: 'sportsJacket', searchOptions: { category: '202923' } },
        { key: 'sportsHat', searchOptions: { category: '202931' } },
      ],
    },
    {
      key: 'sportsShoes',
      searchOptions: { category: '235' },
      children: [
        { key: 'sneakers', searchOptions: { category: '2361' } },
        { key: 'runningShoes', searchOptions: { category: '202869' } },
        { key: 'indoorSoccerShoes', searchOptions: { category: '2131' } },
        { key: 'basketballShoes', searchOptions: { category: '202861' } },
        { key: 'walkingShoes', searchOptions: { category: '202875' } },
        { key: 'outdoorShoes', searchOptions: { category: '2273' } },
        { key: 'tennisShoes', searchOptions: { category: '202873' } },
        { key: 'volleyballShoes', searchOptions: { category: '211605' } },
        { key: 'fitnessShoes', searchOptions: { category: '202863' } },
        { key: 'waterShoes', searchOptions: { category: '207391' } },
        { key: 'skateboardShoes', searchOptions: { category: '329815' } },
        { key: 'outdoorBoots', searchOptions: { category: '2067' } },
        { key: 'slippers', searchOptions: { category: '237' } },
        { key: 'sandals', searchOptions: { category: '239' } },
        { key: 'boots', searchOptions: { category: '2719' } },
        { key: 'snowBoots', searchOptions: { category: '285191' } },
        { key: 'skiBoots', searchOptions: { category: '209063' } },
        { key: 'snowboardBoots', searchOptions: { category: '291771' } },
        { key: 'poolSlippers', searchOptions: { category: 'deniz-terligi' } },
      ],
    },
    {
      key: 'homeGymEquipment',
      searchOptions: { category: '208401' },
      children: [
        { key: 'resistanceBands', searchOptions: { category: '218605' } },
        { key: 'handGrips', searchOptions: { category: '291717' } },
        { key: 'mats', searchOptions: { category: '218607' } },
        { key: 'workoutStations', searchOptions: { category: '208589' } },
        { key: 'jumpRopes', searchOptions: { category: 'atlama-ipi' } },
        { key: 'boxingGloves', searchOptions: { category: '291353' } },
        { key: 'dumbbellSet', searchOptions: { category: '208591' } },
        { key: 'ellipticalBike', searchOptions: { category: 'eliptik-bisiklet' } },
        { key: 'pullUpBars', searchOptions: { category: '208587' } },
        { key: 'gloves', searchOptions: { category: '208583' } },
        { key: 'kettlebell', searchOptions: { category: 'kettlebell' } },
        { key: 'exerciseBike', searchOptions: { category: '208569' } },
        { key: 'treadmills', searchOptions: { category: '208571' } },
        { key: 'pilatesBall', searchOptions: { category: '218601' } },
        { key: 'rowingMachine', searchOptions: { category: '208593' } },
        { key: 'boxingWraps', searchOptions: { category: '291351' } },
        { key: 'crossfit', searchOptions: { category: '291633' } },
      ],
    },
    {
      key: 'sportsEquipment',
      searchOptions: { category: '208403' },
      children: [
        { key: 'seaAndBeach', searchOptions: { category: '209095' } },
        { key: 'skateboard', searchOptions: { category: '2199' } },
        { key: 'skates', searchOptions: { category: '2293' } },
        { key: 'campingEquipment', searchOptions: { category: '208517' } },
        { key: 'mountaineeringAndClimbing', searchOptions: { category: '208553' } },
        { key: 'actionCamera', searchOptions: { category: '208507' } },
        { key: 'tentAndSleepingBag', searchOptions: { category: '208529' } },
        { key: 'waterSportsEquipment', searchOptions: { category: '291819' } },
        { key: 'divingEquipment', searchOptions: { category: '208493' } },
        { key: 'fishingEquipment', searchOptions: { category: '208479' } },
        { key: 'tennisEquipment', searchOptions: { category: '291555' } },
        { key: 'skiAndSnowboard', searchOptions: { category: '291727' } },
        { key: 'archery', searchOptions: { category: '291509' } },
        { key: 'tent', searchOptions: { category: '208525' } },
        { key: 'towel', searchOptions: { category: 'spor-havlusu' } },
        { key: 'waterBottle', searchOptions: { category: '291803' } },
        { key: 'mats', searchOptions: { category: '218607' } },
        { key: 'bicycle', searchOptions: { category: '209177' } },
        { key: 'thermos', searchOptions: { category: '2403' } },
        { key: 'pilatesBalls', searchOptions: { category: '218601' } },
      ],
    },
    {
      key: 'bicycles',
      searchOptions: { category: '209177' },
      children: [
        { key: 'cityBicycle', searchOptions: { category: 'sehir-bisikleti-y-13257' } },
        { key: 'mountainBicycle', searchOptions: { category: 'dag-bisikleti' } },
        { key: 'foldingBicycles', searchOptions: { category: 'katlanabilir-bisiklet' } },
        { key: 'roadBicycles', searchOptions: { category: 'yol-bisikleti' } },
        { key: 'childrenBicycles', searchOptions: { category: '209075' } },
        { key: 'electricBicycles', searchOptions: { category: '220715' } },
        { key: 'cyclingEquipment', searchOptions: { category: '209179' } },
        { key: 'cyclingGlasses', searchOptions: { category: 'bisiklet-gozlugu' } },
        { key: 'bicycleHelmets', searchOptions: { category: '291289' } },
      ],
    },
    {
      key: 'sportsNutrition',
      searchOptions: { category: '210279' },
      children: [
        { key: 'proteinPowder', searchOptions: { category: '208347' } },
        { key: 'aminoAcid', searchOptions: { category: '208337' } },
        { key: 'carbohydrate', searchOptions: { category: '208339' } },
        { key: 'lCarnitineCLA', searchOptions: { category: '208343' } },
        { key: 'strengthAndPerformance', searchOptions: { category: '210205' } },
        { key: 'dietarySupplementsAndVitamins', searchOptions: { category: '210187' } },
        { key: 'creatine', searchOptions: { category: '208341' } },
        { key: 'proteinBar', searchOptions: { category: '220953' } },
        { key: 'shaker', searchOptions: { category: '208467' } },
      ],
    },
    {
      key: 'sportsLowerWear',
      searchOptions: { category: '202911' },
      children: [
        { key: 'tracksuitSet', searchOptions: { category: '202921' } },
        { key: 'leggings', searchOptions: { category: '202937' } },
        { key: 'shorts', searchOptions: { category: '202933' } },
        { key: 'thermalWear', searchOptions: { category: '207443' } },
        { key: 'socks', searchOptions: { category: '2093' } },
        { key: 'sportsPants', searchOptions: { category: '218073' } },
        { key: 'slippers', searchOptions: { category: 'spor-terlik' } },
        { key: 'tracksuitBottom', searchOptions: { category: '2115' } },
      ],
    },
    {
      key: 'fitnessAndConditioning',
      searchOptions: { category: '208563' },
      children: [
        { key: 'pilatesEquipment', searchOptions: { category: '2309' } },
        { key: 'fitnessMachines', searchOptions: { category: '217931' } },
        { key: 'exerciseBike', searchOptions: { category: '208569' } },
        { key: 'treadmill', searchOptions: { category: '208571' } },
        { key: 'yogaEquipment', searchOptions: { category: '208577' } },
        { key: 'dumbbellSet', searchOptions: { category: '218653' } },
        { key: 'weightPlates', searchOptions: { category: '208591' } },
        { key: 'pullUpBars', searchOptions: { category: '208587' } },
      ],
    },
    {
      key: 'balls',
      searchOptions: { category: '208579' },
      children: [
        { key: 'basketball', searchOptions: { category: '218795' } },
        { key: 'football', searchOptions: { category: '218761' } },
      ],
    },
  ],
};
const brands: CategoryNode = {
  key: 'brands',
  icon: 'store',
  children: [
    {
      key: 'brands',
      children: [
        { key: 'Adidas', searchOptions: { brand: '83' } },
        { key: 'adL', searchOptions: { brand: '1127' } },
        { key: 'Aker', searchOptions: { brand: '1339' } },
        { key: 'Altınyıldız Classic', searchOptions: { brand: '543' } },
        { key: 'Arçelik', searchOptions: { brand: '1269' } },
        { key: 'Armani Exchange', searchOptions: { brand: '210883' } },
        { key: 'Arzum', searchOptions: { brand: '801' } },
        { key: 'Asics', searchOptions: { brand: '290975' } },
        { key: 'Avva', searchOptions: { brand: '531' } },
        { key: 'Bambi', searchOptions: { brand: '759' } },
        { key: 'Barbour', searchOptions: { brand: '1649' } },
        { key: 'Beko', searchOptions: { brand: '1581' } },
        { key: 'Benetton', searchOptions: { brand: '301045' } },
        { key: 'Bershka', searchOptions: { brand: '989' } },
        { key: 'Bosch', searchOptions: { brand: '1589' } },
        { key: 'Brooks Brother', searchOptions: { brand: '204947' } },
        { key: 'Cacharel', searchOptions: { brand: '657' } },
        { key: 'Calvin Klein', searchOptions: { brand: '125' } },
        { key: 'Camper', searchOptions: { brand: '383' } },
        { key: "Carter's", searchOptions: { brand: '1487' } },
        { key: 'CAT', searchOptions: { brand: '407' } },
        { key: 'Cigit', searchOptions: { brand: '286903' } },
        { key: 'Civil', searchOptions: { brand: '206015' } },
        { key: 'Colin’s', searchOptions: { brand: '265' } },
        { key: 'Columbia', searchOptions: { brand: '329' } },
        { key: 'Converse', searchOptions: { brand: '327' } },
        { key: 'Dagi', searchOptions: { brand: '285' } },
        { key: 'Defacto', searchOptions: { brand: '91' } },
        { key: 'Decathlon', searchOptions: { brand: '301267' } },
        { key: 'Deno Kids', searchOptions: { brand: '1001' } },
        { key: 'Derimod', searchOptions: { brand: '279' } },
        { key: 'Desa', searchOptions: { brand: '371' } },
        { key: 'Diesel', searchOptions: { brand: '331' } },
        { key: 'Dockers', searchOptions: { brand: '579' } },
        { key: 'Dolce Gabbana', searchOptions: { brand: '679' } },
        { key: 'DS Damat', searchOptions: { brand: '216927' } },
        { key: 'Eastpak', searchOptions: { brand: '753' } },
        { key: 'Electrolux', searchOptions: { brand: '1667' } },
        { key: 'Elle', searchOptions: { brand: '373' } },
        { key: 'Emporio Armani', searchOptions: { brand: '631' } },
        { key: 'Faik Sönmez', searchOptions: { brand: '873' } },
        { key: 'Fabrika', searchOptions: { brand: '1593' } },
        { key: 'Fakir', searchOptions: { brand: '791' } },
        { key: 'Gant', searchOptions: { brand: '203223' } },
        { key: 'GAP', searchOptions: { brand: '877' } },
        { key: 'Goldmaster', searchOptions: { brand: '1621' } },
        { key: 'Greyder', searchOptions: { brand: '1321' } },
        { key: 'Grundig', searchOptions: { brand: '209959' } },
        { key: 'Guess', searchOptions: { brand: '683' } },
        { key: 'Hammer-Jack', searchOptions: { brand: '217847' } },
        { key: 'Happiness Istanbul', searchOptions: { brand: '296881' } },
        { key: 'Harley Davidson', searchOptions: { brand: '1057' } },
        { key: 'Hatemoğlu', searchOptions: { brand: '216841' } },
        { key: 'H&M', searchOptions: { brand: 'hm' } },
        { key: 'Hiccup', searchOptions: { brand: 'hiccup' } },
        { key: 'Hotiç', searchOptions: { brand: '275' } },
        { key: 'Hugo Boss', searchOptions: { brand: '385' } },
        { key: 'Hummel', searchOptions: { brand: '289' } },
        { key: 'İnci', searchOptions: { brand: '115' } },
        { key: 'İpekyol', searchOptions: { brand: '109' } },
        { key: 'Jack Jones', searchOptions: { brand: '375' } },
        { key: 'Jack Wolfskin', searchOptions: { brand: '207003' } },
        { key: 'Karaca', searchOptions: { brand: '667' } },
        { key: 'Karcher', searchOptions: { brand: '206035' } },
        { key: 'Kappa', searchOptions: { brand: '585' } },
        { key: 'Katia Bony', searchOptions: { brand: '218077' } },
        { key: 'Kemal Tanca', searchOptions: { brand: '307' } },
        { key: 'Kinetix', searchOptions: { brand: '925' } },
        { key: 'Kip', searchOptions: { brand: '675' } },
        { key: 'Kiğılı', searchOptions: { brand: '485' } },
        { key: 'KitchenAid', searchOptions: { brand: '220425' } },
        { key: 'Korkmaz', searchOptions: { brand: '719' } },
        { key: 'Koton', searchOptions: { brand: '93' } },
        { key: 'Lacoste', searchOptions: { brand: '293' } },
        { key: 'LC Waikiki', searchOptions: { brand: '1735' } },
        { key: 'Lee', searchOptions: { brand: '1929' } },
        { key: 'Lee Cooper', searchOptions: { brand: '429' } },
        { key: "Levi's", searchOptions: { brand: '595' } },
        { key: 'Limon Company', searchOptions: { brand: '665' } },
        { key: 'Lufian', searchOptions: { brand: '745' } },
        { key: 'Lumberjack', searchOptions: { brand: '653' } },
        { key: 'Mango', searchOptions: { brand: '99, 206271, 206975' } },
        { key: 'Marks&Spencer', searchOptions: { brand: '1235' } },
        { key: 'Massimo Dutti', searchOptions: { brand: '1199' } },
        { key: 'Mavi', searchOptions: { brand: '103' } },
        { key: 'Michael Kors', searchOptions: { brand: '1041' } },
        { key: 'Mudo', searchOptions: { brand: '291' } },
        { key: 'Nautica', searchOptions: { brand: '895' } },
        { key: 'Network', searchOptions: { brand: '315' } },
        { key: 'New Balance', searchOptions: { brand: '273' } },
        { key: 'Nespresso', searchOptions: { brand: '216387' } },
        { key: 'Nike', searchOptions: { brand: '105' } },
        { key: 'Nine West', searchOptions: { brand: '1253' } },
        { key: 'North Face', searchOptions: { brand: '1553' } },
        { key: 'Oysho', searchOptions: { brand: '1191' } },
        { key: 'Panço', searchOptions: { brand: '493' } },
        { key: 'Paul&Shark', searchOptions: { brand: '290811' } },
        { key: 'Penti', searchOptions: { brand: '267' } },
        { key: 'Philips', searchOptions: { brand: '1171' } },
        { key: 'Pierre Cardin', searchOptions: { brand: '261' } },
        { key: 'Profilo', searchOptions: { brand: '210035' } },
        { key: 'Pull&Bear', searchOptions: { brand: '1201' } },
        { key: 'Puma', searchOptions: { brand: '337' } },
        { key: 'Ralph Lauren', searchOptions: { brand: '1115' } },
        { key: 'Ramsey', searchOptions: { brand: '387' } },
        { key: 'Reebok', searchOptions: { brand: '335' } },
        { key: 'Sarar', searchOptions: { brand: '889' } },
        { key: 'Schafer', searchOptions: { brand: '763' } },
        { key: 'Shaka', searchOptions: { brand: '288015' } },
        { key: 'Siemens', searchOptions: { brand: '1609' } },
        { key: 'Singer', searchOptions: { brand: '205065' } },
        { key: 'Skechers', searchOptions: { brand: '1333' } },
        { key: 'Stradivarius', searchOptions: { brand: '311' } },
        { key: 'Suwen', searchOptions: { brand: '559' } },
        { key: 'Tamer Tanca', searchOptions: { brand: '299315' } },
        { key: 'Tefal', searchOptions: { brand: '669' } },
        { key: 'Timberland', searchOptions: { brand: '755' } },
        { key: 'Tommy Hilfiger', searchOptions: { brand: '617' } },
        { key: 'Toyzz Shop', searchOptions: { brand: '1583' } },
        { key: 'Trendyolmilla', searchOptions: { brand: 'trendyolmilla' } },
        { key: 'Touche Prive', searchOptions: { brand: 'toucheprive' } },
        { key: 'Twist', searchOptions: { brand: '353' } },
        { key: 'Tudors', searchOptions: { brand: '202895' } },
        { key: 'Under Armour', searchOptions: { brand: '208395' } },
        { key: 'US_Polo_Assn', searchOptions: { brand: '203997' } },
        { key: 'Vakko', searchOptions: { brand: '1285' } },
        { key: 'Vans', searchOptions: { brand: '1133' } },
        { key: 'Vestel', searchOptions: { brand: '205817' } },
        { key: "Victoria's Secret", searchOptions: { brand: '317' } },
        { key: 'W Collection', searchOptions: { brand: '1507' } },
        { key: 'WWF Market', searchOptions: { brand: '327517' } },
        { key: 'Wrangler', searchOptions: { brand: '222097' } },
        { key: 'Xiaomi', searchOptions: { brand: '203895' } },
        { key: 'Yargıcı', searchOptions: { brand: '839' } },
        { key: 'Zara', searchOptions: { brand: 'zara' } },
      ],
    },
  ],
};

const categories = [women, men, kids, shoesAndBags, sportsAndOutdoor, brands];

export default categories;
