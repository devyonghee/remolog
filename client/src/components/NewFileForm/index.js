import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Presenter from './presenter';

const propTypes = {
    isFileType: PropTypes.bool,
    search: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    addDirectory : PropTypes.func.isRequired,
    addFile : PropTypes.func.isRequired,
    selectedFile : PropTypes.object,
    setSelectTarget : PropTypes.func.isRequired,
    files: PropTypes.arrayOf(
        PropTypes.shape({
            child: PropTypes.array,
            name: PropTypes.string,
            path: PropTypes.string,
            isDirectory: PropTypes.bool,
            isExtended: PropTypes.bool,
        })),
};

const defaultProps = {
    isFileType: false,
    selectedFile: null,
    files: []
};

const container = (props) => {
    const {search, closeNewFileForm, type, addFile, files} = props;
    const [name, setName] = useState('');
    const [selectedFile, setSelectedTarget] = useState(null);
    const [extendedDirectories, setExtendDirectory] = useState([]);

    const handleClickFile = (e, file) => {
        e.preventDefault();
        selectedFile !== file && setSelectedTarget(file);
    };

    const handleCloseForm = () => closeNewFileForm() & setName('');
    const handleNameChange = ({target: {value}}) => setName(value);
    const handleClickConfirm = e => {
        e.preventDefault();
        if(!type) return;

        if (type === 'directory') {
            if (!name) return window.remote.dialog.showErrorBox('New Directory', '폴더명을 입력해주세요.');
            return addFile(name) & setName('');
        }
        if (!selectedFile) return window.remote.dialog.showErrorBox('New File', '파일을 선택해주세요.');
        return addFile(selectedFile) & setSelectedTarget(null);
    };

    const handleNameKeyPress = e => {
        if (e.key.toLowerCase() !== "enter" || !name) return;
        e.preventDefault();
        closeNewFileForm();
        addFile(name);
        setName('');
    };

    const handleDoubleClickFile = (e, file) => {
        e.preventDefault();
        selectedFile !== file && setSelectedTarget(file);
        if (!file.isDirectory) return addFile(file);

        if (extendedDirectories.includes(file)) {
            extendedDirectories.splice(extendedDirectories.indexOf(file), 1);
            return setExtendDirectory([...extendedDirectories]);
        }

        setExtendDirectory([...extendedDirectories, file]);
        if (!!file.child && file.child.length < 1) search(file.path);
    };

    return (
        <Presenter
            {...props}
            files={files}
            type={type}
            name={name}
            selectedFile={selectedFile}
            handleClickFile={handleClickFile}
            handleCloseForm={handleCloseForm}
            handleNameChange={handleNameChange}
            handleClickConfirm={handleClickConfirm}
            handleNameKeyPress={handleNameKeyPress}
            handleDoubleClickFile={handleDoubleClickFile}
        />
    )

};

container.propTypes = propTypes;
container.defaultProps = defaultProps;

export default container;