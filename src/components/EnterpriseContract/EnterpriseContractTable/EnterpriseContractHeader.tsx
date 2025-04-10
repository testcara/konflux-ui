import { createTableHeaders } from '~/utils/table-list-utils';

export const EnterpriseContractTableColumnClasses = {
  expand: 'pf-m-width-5',
  rules: 'pf-m-width-30 wrap-column',
  status: 'pf-m-width-10',
  message: 'pf-m-width-30 wrap-column',
  component: 'pf-m-width-25',
};

export const enum SortableEnterpriseContractHeaders {
  title,
  component,
  status,
}

const enterprisecontractColumns = [
  {
    title: '',
    className: EnterpriseContractTableColumnClasses.expand,
    style: { paddingLeft: '5%' },
  },
  { title: 'Rules', className: EnterpriseContractTableColumnClasses.rules, sortable: true },
  { title: 'Status', className: EnterpriseContractTableColumnClasses.status, sortable: true },
  { title: 'Message', className: EnterpriseContractTableColumnClasses.message },
  { title: 'Component', className: EnterpriseContractTableColumnClasses.component, sortable: true },
];

export default createTableHeaders(enterprisecontractColumns);
