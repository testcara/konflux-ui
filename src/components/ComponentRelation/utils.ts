import { union } from 'lodash-es';
import * as yup from 'yup';
import { K8sQueryPatchResource } from '../../k8s';
import { ComponentModel } from '../../models';
import { NudgeStats } from '../../types';
import {
  ComponentRelationFormikValue,
  ComponentRelationNudgeType,
  ComponentRelationValue,
} from './type';

export const DUPLICATE_RELATONSHIP = 'duplicate-component-relationship';

export const componentRelationValidationSchema = yup.mixed().test(
  (values: ComponentRelationFormikValue) =>
    yup
      .object()
      .shape({
        relations: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                source: yup.string().required(),

                nudgeType: yup.string().required(),
                target: yup.array().of(yup.string()).required().min(0),
              })
              .test('duplicate-relation-test', DUPLICATE_RELATONSHIP, (value) => {
                const filteredValue = values.relations.filter(
                  (val) => val.source === value.source && val.nudgeType === value.nudgeType,
                );
                return filteredValue.length < 2;
              }),
          )
          .required()
          .min(1),
      })
      .validate(values, { abortEarly: false }) as unknown as boolean,
);

export const transformNudgeData = (data: ComponentRelationValue[]): { [key: string]: string[] } => {
  return data.reduce((acc: Record<string, string[]>, { source, nudgeType, target }) => {
    if (!source) return acc;
    if (nudgeType === ComponentRelationNudgeType.NUDGES) {
      acc[source] = acc[source] ? union(acc[source], target) : target;
      return acc;
    }
    target.length > 0 &&
      target.forEach((t) => {
        acc[t] = acc[t] ? union(acc[t], [source]) : [source];
      });
    return acc;
  }, {});
};

export const updateNudgeDependencies = async (
  values: ComponentRelationValue[],
  namespace: string,
  dryRun?: boolean,
) => {
  const transformedData = transformNudgeData(values);
  const data = [];
  for (const [componentName, nudgeData] of Object.entries(transformedData)) {
    const result = await K8sQueryPatchResource({
      model: ComponentModel,
      queryOptions: {
        name: componentName,
        ns: namespace,
        ...(dryRun && { queryParams: { dryRun: 'All' } }),
      },
      patches: [
        {
          op: 'replace',
          path: `/spec/${NudgeStats.NUDGES}`,
          value: nudgeData,
        },
      ],
    });
    data.push(result);
  }
  return data;
};