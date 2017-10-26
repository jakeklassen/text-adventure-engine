import is from 'is_js';

export default function get(target, path = '') {
  if (is.not.array(target) && is.not.object(target)) {
    if (target) return target;

    throw new Error('object must be an array or object');
  }

  if (is.not.string(path)) throw new Error('path must be string');

  const [property, ...properties] = path ? path.split('.') : [];
  const nextPath = properties ? properties.join('.') : '';

  if (!property) return target || undefined;
  if (!path || path === '') return target || undefined;

  if (Array.isArray(target)) {
    const id = property;
    return get(target.find(obj => obj.id == id), nextPath);
  }

  const value = target[property];

  if (!value) return undefined;

  if (Array.isArray(value)) {
    return get(value, nextPath);
  }

  return get(value, nextPath);
}
