/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {makeFakeInstance} from '../../../js_specs/spec_helpers';
import * as SnapshotUtils from '../utils/snapshot-utils';
import Audit from '../../models/business-models/audit';

describe('SnapshotUtils', function () {
  describe('isSnapshotType() method', function () {
    let instance;

    beforeEach(function () {
      instance = {
        type: 'Snapshot',
        viewLink: '/snapshots/123',
      };
    });

    it('isSnapshotType() should return true', function () {
      expect(SnapshotUtils.isSnapshotType(instance))
        .toBe(true);
    });

    it('isSnapshotType() should return false', function () {
      instance.type = 'Assessment';
      expect(SnapshotUtils.isSnapshotType(instance))
        .toBe(false);
    });

    it('isSnapshotType() should return false. Pass empty object', function () {
      expect(SnapshotUtils.isSnapshotType({}))
        .toBe(false);
    });
  });

  describe('getSnapshotItemQuery() method', function () {
    it('getSnapshotItemQuery() should return correct expression',
      function () {
        let relevantInstance = {
          type: 'Assessment',
          viewLink: '/assessments/123',
        };
        let childId = 10;
        let childType = 'Control';

        let query = SnapshotUtils
          .getSnapshotItemQuery(relevantInstance, childId, childType);

        let queryData = query.data[0];
        let queryExpression = queryData.filters.expression;
        let objectName = queryData.object_name;
        let rightNodes = queryExpression.right;

        expect(objectName).toEqual('Snapshot');
        expect(queryExpression.left.object_name).toEqual('Assessment');
        expect(rightNodes.left.left).toEqual('child_type');
        expect(rightNodes.left.right).toEqual(childType);
        expect(rightNodes.right.left).toEqual('child_id');
        expect(rightNodes.right.right).toEqual(childId);
      }
    );
  });

  describe('toObject() method', function () {
    let snapshot;
    let toObject;

    beforeAll(function () {
      toObject = SnapshotUtils.toObject;
    });

    beforeEach(function () {
      makeFakeInstance({model: Audit})({id: 1});
      snapshot = {
        id: 12345,
        type: 'Snapshot',
        child_id: 42,
        child_type: 'Control',
        parent: {
          id: 1,
          type: 'Audit',
        },
        revision: {
          content: {
            access_control_list: [
              {ac_role_id: 10, person_id: 4},
              {ac_role_id: 17, person_id: 2},
              {ac_role_id: 12, person_id: 4},
            ],
          },
        },
      };
    });

    it('adds person stubs to access control list items', function () {
      let result = toObject(snapshot);

      expect(result.access_control_list).toBeDefined();

      result.access_control_list.forEach(function (item) {
        expect(item.person).toBeDefined();
        expect(item.person.type).toEqual('Person');
        expect(item.person.id).toEqual(item.person_id);
      });
    });

    it('sets original link to snapshot object', function () {
      let result = toObject(snapshot);

      expect(result.attr('originalLink')).toEqual('/controls/42');
    });
  });
});
