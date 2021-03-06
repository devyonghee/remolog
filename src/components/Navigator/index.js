import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import container from './container';
import serverActions from 'src/modules/server/actions';
import fileActions from 'src/modules/file/actions';

const mapStateToProps = (state, ownProps) => {
    return {
        files: state.file.list,
        selectedIndex: state.file.selectedIndex,
        servers: state.server.list.map(server => server.url),
        width: ownProps.width,
    };
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        search: serverActions.search,
        toggleExtend: fileActions.toggleExtend,
        selectIndex: fileActions.selectIndex,
        selectServer: index => serverActions.setServerInfo({ selectedServer: index }),
        openNewAdd: type => fileActions.openNewForm(true, type),
        watch: serverActions.watch,
        deleteFile: fileActions.deleteFile,
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(container);