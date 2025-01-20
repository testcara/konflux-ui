import { FormSection, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { InputField } from 'formik-pf';
import { WorkspaceInfoProps } from '../../../types';
import GitRepoLink from '../../GitLink/GitRepoLink';
import HelpPopover from '../../HelpPopover';
import { ImportFormValues } from '../type';
import { SourceSection } from './SourceSection';

export const ComponentSection = ({ namespace, workspace }: WorkspaceInfoProps) => {
  const { values } = useFormikContext<ImportFormValues>();
  return (
    <FormSection>
      <TextContent>
        <Text component={TextVariants.h3}>Component details</Text>
        <Text component={TextVariants.p}>
          A component is an image built from source code repository.
        </Text>
      </TextContent>
      <SourceSection namespace={namespace} workspace={workspace} />
      <InputField
        name="source.git.dockerfileUrl"
        label="Docker file"
        placeholder="/path/to/Dockerfile"
      />
      <InputField
        name="componentName"
        label="Component name"
        isRequired
        data-test="component-name"
        labelIcon={
          <HelpPopover bodyContent="Component name must be unique. A component is a custom resource within a tenant namespace and so its name must be unique." />
        }
      />
      {values.source.git.url ? (
        <GitRepoLink
          url={values.source.git.url}
          revision={values.source.git.revision}
          context={values.source.git.context}
        />
      ) : null}
    </FormSection>
  );
};
