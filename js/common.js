// costanti globali
const WHITESPACES = new RegExp("\\s+", "g");
const WORDS = new RegExp(/\b\w+\b/, "g");


$(document).ready(function () {
    // al click sull'etichetta "Page" si espande il sottomenu
    $("#Page").click(function (event) {
        event.preventDefault(); /*per l'elemento a in html */
        $(".btn2").toggle();
    });
});

Array.prototype.sumOfValues = function () {
    return this.reduce((acc, curr) => acc + curr, 0);
}

Array.prototype.average = function () {
    return this.sumOfValues() / this.length;
}

Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
}

Array.prototype.toShuffled = function () {
    const copy = [...this];
    copy.shuffle();
    return copy;
}

function containsWord(obj, word) {
    for (const value of Object.values(obj)) {
        if (
            typeof value === 'string' &&
            value.toLowerCase().includes(word.toLowerCase())
        ) {
            return true;
        }
    }
    return false;
}

function loadPhotosFromCSV(filename, photos_subfolder) {
    window.photoDB = undefined;
    const CSV_PATH = '../database/' + filename;

    // scarica i dati dal csv
    $.get(CSV_PATH, function (csv) {
        photoDB = $.csv.toObjects(csv, {
            separator: ';',
            delimiter: '"'
        });

        // rimozione di spazi multipli, spazi iniziali o finali, elementi vuoti nei TAG
        $.each(photoDB, function (i, row) {
            let cleanTags = row.tags.split("-");
            $.each(cleanTags, function (i, tag) {
                let cleanString = tag.replace(WHITESPACES, ' ').trim();
                cleanTags[i] = cleanString.toLowerCase();
                if (cleanString.length == 0) cleanTags.splice(i, 1);
            });
            row.tags = cleanTags;
        });

        // creazione sezioni per anno
        createYearSections();

        // popolamento griglie di immagini
        loadImagesFromDatabase(photos_subfolder);

    });
}

function createYearSections() {
    let years = [...new Set(photoDB.map(x => x.year))].sort();
    var templateContent = $('#gallery-template').html();

    years.forEach(function (y) {
        var clone = $(templateContent);
        clone[0].classList.add(y); //clone.find('.year').addClass(String(y));
        clone.find('label').attr('for', `y${y}`).text(y);
        clone.find('input').attr('id', `y${y}`);
        $('#photo-grids').append(clone);
    });
}

function loadImagesFromDatabase(photos_subfolder) {
    const IMAGE_ROOT = `../Immagini/${photos_subfolder}/`;
    const THUMB_SUFFIX = ' ' + '(Piccole)';
    const EXTENSION = '.jpg';

    var templateContent = $('#image-template').html();
    var galleries = Array.from($('.year'));

    photoDB.forEach(function (image, i) {
        // clona il template
        var clone = $(templateContent);
        var { name, title, description, tags } = image;
        var source = IMAGE_ROOT + name + THUMB_SUFFIX + EXTENSION;

        // controlla se l'immagine piccola esiste, altrimenti carica l'immagine grande
        let alternativePath = false;
        let img = new Image();
        img.src = source;
        img.onerror = function (event) {
            event.preventDefault();
            console.log(`${source} does not exist or failed to load.`);
            if (!alternativePath) {
                // azioni su errore immagine piccola
                alternativePath = true;
                source = IMAGE_ROOT + name + EXTENSION;
                img.src = source;
                clone.find('img').attr('src', source);
            } else {
                // azioni su errore immagine grande
                console.warn(`Both objects don't exist or failed to load for ${name}`);
            }
        };

        // carica l'immagine solo se si carica correttamente
        img.onload = function () {
            // inserisci le informazioni della riga csv nel clone
            clone.find('img')
                .attr('src', source)
                .attr('alt', title)
                .attr('data-title', title)
                .attr('data-description', description);
            clone.find('.title').text(title);
            clone.find('.description').text(description);
            tags.forEach(tag => {
                var tagSpan = $('<span>').text(tag);
                clone.find('.tags').append(tagSpan);
            });

            // inserisci il clone nella galleria corrispondente
            var { year, column } = image;
            var targetGallery = galleries.find(function (element) {
                return element.classList.contains(year);
            });
            var targetColumn = $(targetGallery).find('.column');
            column = i % targetColumn.length;
            targetColumn = targetColumn[column];
            $(targetColumn).append(clone);
        }
    });
}

function partition(values, subsets, options = {}) {
    // handle errors on parameters
    try {
        if (!Array.isArray(values)) throw new Error('First parameter must be an array.');
        if (!values.every(val => typeof val === 'number')) throw new Error('First parameter must be an array of numbers.');
        if (subsets !== Math.round(subsets)) throw new Error('Second parameter must be an integer number.');
    } catch (error) {
        console.error(error.message);
        return;
    }

    // algorithm options
    const defaults = {
        order: 'ORIGINAL',
        lastExceedingToFirst: true,
        lastExceedingThreshold: 2
    }
    // order: ORIGINAL, RANDOM, OPTIMIZE-LAST, OPTIMIZE-ALL (OPTIMIZED not implemented)
    // lastExceedingToFirst: Boolean (if last set is longer than n times the average error, slide elements to make the first longer instead)
    // lastExceedingThreshold: Number (factor to trigger lastExceedingToFirst)

    const localOptions = { ...defaults };
    for (let key in options) { localOptions[key] = options[key] };

    // organize source data
    var data = [];
    values.forEach((v, i) => {
        var obj = {
            value: v,
            index: i
        };
        data.push(obj);
    });

    // partition algorithm
    const sets = Array.from({ length: subsets }, () => Array(0)); // create an array of n empty arrays
    var errors, absErrors;
    const sum = values.sumOfValues();
    const limit = sum / subsets;
    var setIndex = 0;

    if (localOptions.order === 'RANDOM') data.shuffle();

    data.forEach(d => {
        let currError, nextError;
        currError = sets[setIndex].map(x => x.value).sumOfValues() - limit;
        nextError = currError + d.value;
        // confronta l'errore attuale e prossimo per decidere se passare alla prossima colonna
        let goToNextIndex = Math.abs(nextError) > Math.abs(currError);
        let lastIndex = setIndex === subsets - 1;

        if (goToNextIndex && !lastIndex) { setIndex++ }
        sets[setIndex].push(d);
    });

    // calculate errors & deviation of last set
    function updateErrors() {
        errors = sets.map(a => a.map(el => el.value)).map(s => s.sumOfValues() - limit);
        absErrors = errors.map(n => Math.abs(n));
    }

    updateErrors();
    let lastDev = Math.abs(errors.at(-1) / Math.max(...absErrors.slice(0, -1)));
    // calculate the last set deviation by dividing its error by the max error of remaining sets

    if (
        localOptions.lastExceedingToFirst &&
        lastDev >= localOptions.lastExceedingThreshold
    ) {
        for (let i = sets.length - 1; i > 0; i--) {
            let moved = sets[i].shift();;
            sets[i - 1].push(moved);
        }
        updateErrors();
    }
    
    return {
        sets: sets,
        values: sets.map(a => a.map(el => el.value)),
        indeces: sets.map(a => a.map(el => el.index)),
        errors: {
            rel: errors,
            abs: absErrors
        },
        limit: limit,
        sum: sum
    };
}