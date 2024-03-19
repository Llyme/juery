/**
 * Returns all possible paths in the object.
 * 
 * @param {object} json 
 */
export function* traverse(json) {
    if (json != null) {
        const stack = [[[], json]];

        while (stack.length > 0) {
            const [
                rootpath,
                context
            ] = stack.pop();

            for (const key in context) {
                const path = [...rootpath, key];
                const value = context[key];

                yield {
                    path,
                    key,
                    value
                };

                if (typeof (value) === 'object')
                    stack.push([path, value]);
            }
        }
    }
}

/**
 * Returns all paths with keys containing
 * at least 1 of the given keywords.
 * 
 * @param {object} json 
 * @param  {...string} keywords 
 */
export function* keysWith(json, ...keywords) {
    if (json != null)
        for (const payload of traverse(json))
            for (const key of keywords)
                if (payload.key.toLowerCase().includes(key.toLowerCase())) {
                    yield payload;
                    break;
                }
}

/**
 * Returns all paths with values containing
 * at least 1 of the given keywords.
 * 
 * Only returns paths with string and number values.
 * 
 * @param {object} json 
 * @param  {...string} keywords 
 */
export function* valuesWith(json, ...keywords) {
    if (json != null)
        for (const payload of traverse(json))
            switch (typeof (payload.value)) {
                case 'string':
                case 'number':
                    const value =
                        payload.value
                            .toString()
                            .toLowerCase();

                    for (const keyword of keywords)
                        if (value.includes(keyword.toLowerCase()))
                            yield payload;
                    break;
            }
}

/**
 * JSON query.
 * 
 * [Syntax]
 * 
 * ^ = Direct Descendant; ('parent', '^direct_descendant', ...)
 * 
 * @param {object} json 
 * @param {...string} keys 
 */
export function* juery(json, ...keys) {
    if (json != null)
        for (const payload of traverse(json)) {
            if (keys.length > payload.path.length)
                continue;

            let index = 0;

            for (let i = 0; i < payload.path.length; i++) {
                if (index >= keys.length) {
                    // Comparator terminated before
                    // finishing the path.
                    // Exclude this payload.
                    index = -1;
                    break;
                }

                let a = keys[index];
                const directDescendant = a.startsWith('^');

                if (directDescendant)
                    a = a.substr(1);

                const b = payload.path[i];


                if (a.toLowerCase() === b.toLowerCase()) {
                    index++;

                } else if (directDescendant) {
                    // Not a direct descendant.
                    index = -1;
                    break;
                }
            }

            if (index === keys.length)
                yield payload;
        }
}

/**
 * JSON query.
 */
export function jueryOne(json, ...keys) {
    if (json == null)
        return null;

    for (const payload of juery(json, ...keys))
        return payload;

    return null;
}