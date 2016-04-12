import {DRAW_MODES, isTypedArray} from './webgl/types';
import {uid} from './utils';
import assert from 'assert';

const ILLEGAL_ARG = 'Geometry: Illegal argument';

export default class Geometry {

  constructor({
    id = uid(),
    drawMode = 'TRIANGLES',
    vertexCount = undefined,
    attributes,
    ...attrs
  }) {
    assert(DRAW_MODES.includes(drawMode), ILLEGAL_ARG);

    this.id = id;
    this.drawMode = drawMode;
    this.vertexCount = vertexCount;
    this.attributes = {};
    this.userData = {};
    Object.seal(this);

    this.setAttributes(attributes);
    this.setAttributes(attrs);
  }

  setVertexCount(vertexCount) {
    this.vertexCount = vertexCount;
  }

  getVertexCount() {
    if (this.vertexCount !== undefined) {
      return this.vertexCount;
    } else if (this.attributes.indices) {
      return this.attributes.indices.value.length;
    } else if (this.attributes.vertices) {
      return this.attributes.vertices.value.length / 3;
    }
    return false;
  }

  hasAttribute(attributeName) {
    return Boolean(this.attributes[attributeName]);
  }

  getAttribute(attributeName) {
    const attribute = this.attributes[attributeName];
    assert(attribute);
    return attribute.value;
  }

  getArray(attributeName) {
    const attribute = this.attributes[attributeName];
    assert(attribute);
    return attribute.value;
  }

  // Attribute
  //  value: typed array
  //  type: indices, vertices, uvs
  //  size: elements per vertex
  //  bufferType: WebGL buffer type (string or constant)
  /* eslint-disable default-case */
  setAttributes(attributes) {
    for (const attributeName in attributes) {
      let attribute = attributes[attributeName];
      // Support type arrays
      if (isTypedArray(attribute)) {
        attribute = {value: attribute};
      }
      // Check for well known attribute names
      switch (attributeName) {
      case 'indices':
        attribute.type = attribute.type || 'indices';
        break;
      case 'texCoords':
        attribute.type = 'uvs';
        break;
      case 'vertices':
      case 'positions':
      case 'colors':
      case 'normals':
      case 'pickingColors':
        attribute.size = 3;
        break;
      }

      // Check for types
      switch (attribute.type) {
      case 'indices':
        attribute.size = 1;
        attribute.bufferType = 'ELEMENT_ARRAY_BUFFER';
        attribute.instanced = 0;
        break;
      case 'uvs':
        attribute.size = 2;
        break;
      }
      assert(attribute.value, `attribute ${attributeName} needs value`);
      assert(attribute.size, `attribute ${attributeName} needs size`);

      this.attributes[attributeName] = {
        ...attribute,
        instanced: attribute.instanced || 0
      };
    }
    return this;
  }
  /* eslint-enable default-case */

  getAttributes() {
    return this.attributes;
  }

  // TODO - remove code below
  get vertices() {
    return this.attributes.vertices;
  }

  get normals() {
    return this.attributes.normals;
  }

  get colors() {
    return this.attributes.colors;
  }

  get texCoords() {
    return this.attributes.texCoords;
  }

  get indices() {
    return this.attributes.indices;
  }

  /*
  set vertices(val) {
    if (!val) {
      delete this.$vertices;
      delete this.$verticesLength;
      return;
    }
    const vlen = val.length;
    if (val.BYTES_PER_ELEMENT) {
      this.$vertices = val;
    } else if (this.$verticesLength === vlen) {
      this.$vertices.set(val);
    } else {
      this.$vertices = new Float32Array(val);
    }
    this.$verticesLength = vlen;
  }

  set normals(val) {
    if (!val) {
      delete this.$normals;
      delete this.$normalsLength;
      return;
    }
    const vlen = val.length;
    if (val.BYTES_PER_ELEMENT) {
      this.$normals = val;
    } else if (this.$normalsLength === vlen) {
      this.$normals.set(val);
    } else {
      this.$normals = new Float32Array(val);
    }
    this.$normalsLength = vlen;
  }

  set colors(val) {
    if (!val) {
      delete this.$colors;
      delete this.$colorsLength;
      return;
    }
    const vlen = val.length;
    if (val.BYTES_PER_ELEMENT) {
      this.$colors = val;
    } else if (this.$colorsLength === vlen) {
      this.$colors.set(val);
    } else {
      this.$colors = new Float32Array(val);
    }
    if (this.$vertices && this.$verticesLength / 3 * 4 !== vlen) {
      this.$colors = normalizeColors(
        Array.slice.call(this.$colors), this.$verticesLength / 3 * 4);
    }
    this.$colorsLength = this.$colors.length;
  }

  set pickingColors(val) {
    if (!val) {
      delete this.$pickingColors;
      delete this.$pickingColorsLength;
      return;
    }
    const vlen = val.length;
    if (val.BYTES_PER_ELEMENT) {
      this.$pickingColors = val;
    } else if (this.$pickingColorsLength === vlen) {
      this.$pickingColors.set(val);
    } else {
      this.$pickingColors = new Float32Array(val);
    }
    if (this.$vertices && this.$verticesLength / 3 * 4 !== vlen) {
      this.$pickingColors = normalizeColors(
        Array.slice.call(this.$pickingColors), this.$verticesLength / 3 * 4);
    }
    this.$pickingColorsLength = this.$pickingColors.length;
  }

  get pickingColors() {
    return this.$pickingColors;
  }

  get texCoords() {
    return this.$texCoords;
  }

  set texCoords(val) {
    if (!val) {
      delete this.$texCoords;
      delete this.$texCoordsLength;
      return;
    }
    if (val.constructor.name === 'Object') {
      var ans = {};
      for (var prop in val) {
        var texCoordArray = val[prop];
        ans[prop] = texCoordArray.BYTES_PER_ELEMENT ?
          texCoordArray : new Float32Array(texCoordArray);
      }
      this.$texCoords = ans;
    } else {
      var vlen = val.length;
      if (val.BYTES_PER_ELEMENT) {
        this.$texCoords = val;
      } else if (this.$texCoordsLength === vlen) {
        this.$texCoords.set(val);
      } else {
        this.$texCoords = new Float32Array(val);
      }
      this.$texCoordsLength = vlen;
    }
  }

  set indices(val) {
    if (!val) {
      delete this.$indices;
      delete this.$indicesLength;
      return;
    }
    var vlen = val.length;
    if (val.BYTES_PER_ELEMENT) {
      this.$indices = val;
    } else if (this.$indicesLength === vlen) {
      this.$indices.set(val);
    } else {
      this.$indices = new Uint16Array(val);
    }
    this.$indicesLength = vlen;
  }
  */

}

/*
function normalizeColors(arr, len) {
  if (arr && arr.length < len) {
    const a0 = arr[0];
    const a1 = arr[1];
    const a2 = arr[2];
    const a3 = arr[3];
    const ans = [a0, a1, a2, a3];
    let times = len / arr.length;
    let index;

    while (--times) {
      index = times * 4;
      ans[index + 0] = a0;
      ans[index + 1] = a1;
      ans[index + 2] = a2;
      ans[index + 3] = a3;
    }

    return new Float32Array(ans);
  }
  return arr;
}
*/
