/**
 * Evaluate the `object_has_objects` game expression. Search rooms' objects for
 * each object in `objects`.
 *
 * @param {Array} rooms
 * @param {Array<{ room: String, object: String, has: String}>} objects
 * @returns Boolean
 */
const objectHasObjects = (rooms = [], objects = []) =>
  objects.every(({ room: roomId, object: objectId, has }) => {
    const room = rooms.find(room => room.id === roomId);

    if (!room) return false;

    const object = room.objects.find(o => o.id === objectId);
    if (!object) return false;

    return object.objects.find(o => o.id === has);
  });

export default objectHasObjects;
