import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useStyles from './styles';
import FileList from '../FileList';
import { DIRECTORY } from 'src/modules/utils';

const propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    files: PropTypes.array,
    opened: PropTypes.bool,
    filterString: PropTypes.string,
    selectedFile: PropTypes.array,
    handleClose: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleKeypress: PropTypes.func.isRequired,
    handleClickFile: PropTypes.func.isRequired,
    handleClickConfirm: PropTypes.func.isRequired,
    handleDoubleClickFile: PropTypes.func.isRequired,
};

const defaultProps = {
    name: '',
    filterString: '',
    files: [],
};

const presenter = (props) => {
    const {
        type,
        name,
        files,
        opened,
        filterString,
        selectedFile,
        handleClose,
        handleChange,
        handleKeypress,
        handleClickFile,
        handleClickConfirm,
        handleDoubleClickFile,
    } = props;

    const classes = useStyles();

    return (
        <Dialog
            aria-labelledby="alert-dialog-title"
            aria-describedby="simple-modal-description"
            open={opened}
            onClose={handleClose}
            transitionDuration={{ exit: 0 }}
            fullWidth
            classes={(type === DIRECTORY) ? null : { paper: classes.wrapPaper }}
            maxWidth={(type === DIRECTORY) ? 'xs' : 'sm'}
        >
            <DialogTitle id="alert-dialog-title">
                {`New ${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()}`}
            </DialogTitle>
            <DialogContent>
                {(type === DIRECTORY) ?
                    <TextField
                        margin="dense"
                        className={classes.textField}
                        helperText="Enter a New Directory Name"
                        fullWidth
                        autoFocus
                        inputProps={{
                            onChange: handleChange('name'),
                            onKeyPress: handleKeypress,
                            value: name
                        }}
                    /> :
                    <>
                        <div className={classes.wrapNewFileForm}>
                            <TextField
                                margin="dense"
                                placeholder="search"
                                fullWidth
                                variant="outlined"
                                inputProps={{
                                    onChange: handleChange('filter'),
                                    value: filterString
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                            <List dense className={classes.folderList}>
                                <FileList
                                    lazyLoading
                                    dense
                                    regexp={filterString ? new RegExp(filterString, 'gi') : null}
                                    files={files}
                                    invisibleSwitch
                                    selectedIndex={selectedFile}
                                    handleClickFile={handleClickFile}
                                    handleDoubleClickFile={handleDoubleClickFile}
                                />
                            </List>
                        </div>
                    </>
                }
            </DialogContent>
            <DialogActions>
                <Button color="primary" size="small" onClick={handleClickConfirm}>
                    OK
                </Button>
                <Button color="secondary" size="small" onClick={handleClose}>
                    Cancel
                </Button>
            </DialogActions>

        </Dialog>
    );
};

presenter.propTypes = propTypes;
presenter.defaultProps = defaultProps;

export default presenter;