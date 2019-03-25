import { connect } from 'react-redux';
import prepare from 'app/utils/prepare';
import {
  fetchAdmin,
  deleteSemesterStatus,
  deleteCompanyContact,
  fetchSemesters,
  editSemesterStatus,
  fetchEventsForCompany,
  editCompany,
  deleteCompany
} from 'app/actions/CompanyActions';
import BdbDetail from './components/BdbDetail';
import { compose } from 'redux';
import {
  selectCompanyById,
  selectEventsForCompany,
  selectCommentsForCompany
} from 'app/reducers/companies';
import { selectCompanySemesters } from 'app/reducers/companySemesters';
import { LoginPage } from 'app/components/LoginForm';
import replaceUnlessLoggedIn from 'app/utils/replaceUnlessLoggedIn';
import { deleteComment } from 'app/actions/CommentActions';
import { selectPagination } from 'app/reducers/selectors';
import createQueryString from 'app/utils/createQueryString';

const queryString = companyId =>
  createQueryString({
    company: companyId,
    ordering: '-start_time'
  });

const loadData = ({ params: { companyId } }, dispatch) =>
  Promise.all([
    dispatch(fetchSemesters()).then(() => dispatch(fetchAdmin(companyId))),
    dispatch(
      fetchEventsForCompany({
        queryString: queryString(companyId),
        loadNextPage: false
      })
    )
  ]);

const mapStateToProps = (state, props) => {
  const companyId = Number(props.params.companyId);
  const company = selectCompanyById(state, { companyId });
  const comments = selectCommentsForCompany(state, { companyId });
  const companyEvents = selectEventsForCompany(state, { companyId });
  const companySemesters = selectCompanySemesters(state, props);
  const fetching = state.companies.fetching;
  const showFetchMoreEvents = selectPagination('events', {
    queryString: queryString(companyId)
  })(state);
  return {
    company,
    companyId,
    companyEvents,
    comments,
    companySemesters,
    fetching,
    showFetchMoreEvents
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const { companyId } = props.params;
  const fetchMoreEvents = () =>
    dispatch(
      fetchEventsForCompany({
        queryString: queryString(companyId),
        loadNextPage: true
      })
    );
  return {
    deleteSemesterStatus: (companyId, semesterStatusId) =>
      dispatch(deleteSemesterStatus(companyId, semesterStatusId)),
    deleteCompanyContact: (companyId, constactId) =>
      dispatch(deleteCompanyContact(companyId, constactId)),
    editSemesterStatus: data => dispatch(editSemesterStatus(data)),
    editCompany: data => dispatch(editCompany(data)),
    deleteCompany: companyId => dispatch(deleteCompany(companyId)),
    deleteComment: commentId => dispatch(deleteComment(commentId)),
    fetchMoreEvents
  };
};

export default compose(
  replaceUnlessLoggedIn(LoginPage),
  prepare(loadData, ['params.companyId']),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(BdbDetail);
