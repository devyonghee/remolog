import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemIcon, ListItemText, Switch, Typography } from '@material-ui/core';
import {
    ArrowDropDown as ArrowDropDownIcon,
    ArrowRight as ArrowRightIcon,
    Computer as ComputerIcon,
    Folder as FolderIcon,
    InsertDriveFile as FileIcon
} from '@material-ui/icons';
import classNames from 'classnames';
import useStyles from './styles';
import HighLighter from '../Highlighter';
import { DIRECTORY, FILE, SERVER } from 'src/modules/utils';

const propTypes = {
    files: PropTypes.array,
    regexp: PropTypes.instanceOf(RegExp),
    parentIndex: PropTypes.number,
    selectedTarget: PropTypes.object,
    depth: PropTypes.number,
    dense: PropTypes.bool,
    draggable: PropTypes.bool,
    switchable: PropTypes.bool,
    lazyLoading: PropTypes.bool,
    handleClickFile: PropTypes.func,
    handleFileWatchSwitch: PropTypes.func,
    handleContextMenuList: PropTypes.func,
};

const defaultProps = {
    files: [],
    parentIndex: -1,
    regexp: null,
    depth: 0,
    indexes: [],
    dense: false,
    draggable: false,
    invisibleWhenEmpty: false,
    handleClickFile: () => null,
    handleContextMenuList: () => null,
    handleFileWatchSwitch: () => null,
};

const ArrowIcon = ({ extended, onClick, className }) => {
    const Icon = (extended) ? ArrowDropDownIcon : ArrowRightIcon;
    return (<Icon onClick={onClick} className={className}/>);
};

const IconByType = (props) => {
    let Icon;
    switch (props.type) {
        case SERVER:
            Icon = ComputerIcon;
            break;
        case DIRECTORY:
            Icon = FolderIcon;
            break;
        default:
            Icon = FileIcon;
    }
    return <Icon className={props.className}/>;
};

const sortCompare = (preFile, curFile) => {
    if (preFile.type !== curFile.type) {
        return (preFile.type === DIRECTORY && curFile.type !== DIRECTORY) ? -1 : 1;
    }
    const icmp = preFile.name.toLowerCase().localeCompare(curFile.name.toLowerCase());
    if (icmp !== 0) return icmp;
    if (preFile.name > curFile.name) return 1;
    else if (preFile.name < curFile.name) return -1;
    else return 0;
};

const FileList = props => {
    const {
        files,
        parentIndex,
        regexp,
        selectedTarget,
        depth,
        dense,
        switchable,
        lazyLoading,
        handleClickFile,
        handleDoubleClickFile,
        handleFileWatchSwitch,
        handleContextMenuList,
    } = props;

    const classes = useStyles({ depth, dense });
    return files
        .filter(file => (parentIndex < 0) ? (!file.parentIndex || file.parentIndex < 0) : parentIndex === file.parentIndex)
        .filter(file => file.type !== FILE || !regexp || file.name.match(regexp))
        .sort(sortCompare).map(curFile => {
            const curIndex = files.findIndex(file => file === curFile);

            return (
                <Fragment key={curIndex}>
                    <ListItem
                        className={classes.listItem}
                        selected={curFile === selectedTarget}
                        onClick={handleClickFile(curFile)}
                        onDoubleClick={handleDoubleClickFile(curFile)}
                        onContextMenu={handleContextMenuList(curFile)}
                    >
                        <ListItemIcon
                            className={curFile.type === FILE ? classNames(classes.iconWrap, classes.iconPadding) : classes.iconWrap}>
                            <>
                                {curFile.type !== FILE &&
                                <ArrowIcon
                                    onClick={handleDoubleClickFile(curFile)}
                                    className={classes.arrowIcon}
                                    extended={curFile.extended}/>}
                                <IconByType type={curFile.type} className={classes.iconMargin}/>
                            </>
                        </ListItemIcon>
                        <ListItemText
                            className={classes.textList}
                            primary={
                                <Typography>
                                    {regexp && curFile.type === FILE ? curFile.name :
                                        <HighLighter regexp={regexp}>{curFile.name}</HighLighter>}
                                </Typography>
                            }
                        />
                        {switchable && curFile.type === FILE ?
                            <Switch
                                classes={{
                                    root: classes.switchRoot,
                                    switchBase: classes[`colorSwitchBase${curFile.color}`],
                                    checked: classes[`colorSwitchChecked${curFile.color}`],
                                    track: classes[`colorSwitchBar${curFile.color}`],
                                }}
                                onChange={handleFileWatchSwitch(curFile)}
                                checked={false}/> : null}
                    </ListItem>
                    {curFile.extended ?
                        (files.some(file => file.parentIndex === curIndex)) ?
                            <FileList {...props} parentIndex={curIndex} depth={depth + 1}/> : (
                                <ListItem className={classes.emptyText}>
                                    <ListItemText
                                        className={classes.textList}
                                        disableTypography
                                        primary={!curFile.child && lazyLoading ? '...loading' : '빈 폴더입니다.'}/>
                                </ListItem>)
                        : null
                    }
                </Fragment>
            );
        });

};

FileList.propTypes = propTypes;
FileList.defaultProps = defaultProps;

export default FileList;