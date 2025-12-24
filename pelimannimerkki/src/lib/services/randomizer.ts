import type { NameSort } from '../stores/settingsStore';

const DANCE_TYPES = ['polska', 'valssi', 'vals', 'menuetti', 'polkka', 'marssi', 'sottiisi', 'schottis'];

export function getDanceType(row: string[]): string | null {
  const text = row[1]?.toLowerCase() || '';
  for (const type of DANCE_TYPES) {
    if (text.includes(type)) {
      return type === 'vals' ? 'valssi' : type === 'schottis' ? 'sottiisi' : type;
    }
  }
  return null;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function processGroup(group: string[][], hardestFirst: boolean): string[][] {
  if (!hardestFirst) {
    return shuffleArray(group);
  }

  // Group by difficulty
  const difficultyGroups = new Map<number, string[][]>();
  group.forEach(row => {
    const diff = parseInt(row[2]) || 999;
    if (!difficultyGroups.has(diff)) {
      difficultyGroups.set(diff, []);
    }
    difficultyGroups.get(diff)!.push(row);
  });

  // Sort difficulties (lowest first) and randomize within each group
  const sortedDiffs = Array.from(difficultyGroups.keys()).sort((a, b) => a - b);
  const result: string[][] = [];
  
  sortedDiffs.forEach(diff => {
    const subGroup = difficultyGroups.get(diff)!;
    result.push(...shuffleArray(subGroup));
  });
  
  return result;
}

function applyDistanceSpacing(workingData: string[][]): string[][] {
  const result: string[][] = [];
  const pending = [...workingData];

  while (pending.length > 0) {
    let bestIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < pending.length; i++) {
      const danceType = getDanceType(pending[i]);
      if (!danceType) {
        bestIndex = i;
        break;
      }

      // Calculate minimum distance to same dance type in result
      let minDistance = result.length;
      for (let j = result.length - 1; j >= 0; j--) {
        if (getDanceType(result[j]) === danceType) {
          minDistance = result.length - j;
          break;
        }
      }

      if (minDistance > bestScore) {
        bestScore = minDistance;
        bestIndex = i;
      }
    }

    result.push(pending[bestIndex]);
    pending.splice(bestIndex, 1);
  }

  return result;
}

export interface RandomizeOptions {
  hardestFirst: boolean;
  favoritesFirst: boolean;
  nameSort: NameSort;
  favorites: Set<string>;
}

export function randomizeWithDistance(data: string[][], options: RandomizeOptions): string[][] {
  if (data.length === 0) return [];

  const { hardestFirst, favoritesFirst, nameSort, favorites } = options;

  // Filter out rows with less than 3 chars in column B
  let workingData = data.filter(row => {
    const colB = row[0] || '';
    return colB.trim().length >= 3;
  });

  // Separate favorites and non-favorites
  const favoriteRows = workingData.filter(row => favorites.has(row[0]));
  const nonFavoriteRows = workingData.filter(row => !favorites.has(row[0]));

  // Process based on favoritesFirst setting
  if (favoritesFirst) {
    const processedFavorites = processGroup(favoriteRows, hardestFirst);
    const processedNonFavorites = processGroup(nonFavoriteRows, hardestFirst);
    workingData = [...processedFavorites, ...processedNonFavorites];
  } else {
    const combinedRows = [...favoriteRows, ...nonFavoriteRows];
    workingData = processGroup(combinedRows, hardestFirst);
  }

  // Apply distance algorithm
  const result = applyDistanceSpacing(workingData);

  // Apply name sorting if enabled
  if (nameSort !== 'none') {
    result.sort((a, b) => {
      const nameA = (a[0] || '').toLowerCase();
      const nameB = (b[0] || '').toLowerCase();
      return nameSort === 'asc'
        ? nameA.localeCompare(nameB, 'fi')
        : nameB.localeCompare(nameA, 'fi');
    });
  }

  return result;
}

