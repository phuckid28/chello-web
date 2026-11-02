import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded'
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded'
import ViewTimelineRoundedIcon from '@mui/icons-material/ViewTimelineRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

function BoardCardContextMenu({
  menuAnchor,
  menuBoard,
  onClose,
  onSelectActiveBoardId,
  onEditBoard,
  onOpenBoardInView,
  onOpenWiki,
  onQuickExportBoard,
  onDuplicateBoard,
  onToggleBoardVisibility,
  onCopyBoardLink,
  onDeleteBoard
}) {
  return (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={onClose}
      PaperProps={{ sx: { width: 270, borderRadius: '12px', py: 0.5 } }}
    >
      <MenuItem
        onClick={() => {
          const target = menuBoard
          onClose()
          if (target) onSelectActiveBoardId(target._id)
        }}
      >
        <ListItemIcon><PushPinOutlinedIcon fontSize='small' color='info' /></ListItemIcon>
        <ListItemText primary='Đặt làm Sprint Hiện Tại' primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
      </MenuItem>

      <MenuItem
        onClick={() => {
          const target = menuBoard
          onClose()
          if (target) onEditBoard(target)
        }}
      >
        <ListItemIcon><EditOutlinedIcon fontSize='small' color='primary' /></ListItemIcon>
        <ListItemText primary='Chỉnh sửa thông tin & Chu kỳ' primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem onClick={() => onOpenBoardInView(menuBoard?._id, 'overview')}>
        <ListItemIcon><TableChartRoundedIcon fontSize='small' /></ListItemIcon>
        <ListItemText primary='Mở ở chế độ Sprint Matrix' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <MenuItem onClick={() => onOpenBoardInView(menuBoard?._id, 'kanban')}>
        <ListItemIcon><ViewKanbanRoundedIcon fontSize='small' /></ListItemIcon>
        <ListItemText primary='Mở ở chế độ Kanban Board' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <MenuItem onClick={() => onOpenBoardInView(menuBoard?._id, 'timeline')}>
        <ListItemIcon><ViewTimelineRoundedIcon fontSize='small' /></ListItemIcon>
        <ListItemText primary='Mở ở chế độ Timeline Gantt' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <MenuItem onClick={() => onOpenBoardInView(menuBoard?._id, 'graph')}>
        <ListItemIcon><HubRoundedIcon fontSize='small' /></ListItemIcon>
        <ListItemText primary='Mở Sơ đồ tri thức Obsidian' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <MenuItem
        onClick={() => {
          const targetId = menuBoard?._id
          onClose()
          if (targetId) onOpenWiki(targetId)
        }}
      >
        <ListItemIcon><MenuBookRoundedIcon fontSize='small' /></ListItemIcon>
        <ListItemText primary='Mở Knowledge Hub (Wiki)' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem onClick={() => onQuickExportBoard(menuBoard, 'excel')}>
        <ListItemIcon><FileDownloadOutlinedIcon fontSize='small' color='success' /></ListItemIcon>
        <ListItemText primary='Xuất báo cáo Excel (.xls)' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <MenuItem onClick={() => onQuickExportBoard(menuBoard, 'csv')}>
        <ListItemIcon><FileDownloadOutlinedIcon fontSize='small' color='info' /></ListItemIcon>
        <ListItemText primary='Xuất file CSV mẫu (.csv)' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <MenuItem onClick={() => onDuplicateBoard(menuBoard)}>
        <ListItemIcon><ContentCopyRoundedIcon fontSize='small' /></ListItemIcon>
        <ListItemText primary='Nhân bản / Sao chép Bảng Sprint' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <MenuItem onClick={() => onToggleBoardVisibility(menuBoard)}>
        <ListItemIcon>
          {menuBoard?.type === 'private' ? <PublicRoundedIcon fontSize='small' /> : <LockOutlinedIcon fontSize='small' />}
        </ListItemIcon>
        <ListItemText
          primary={menuBoard?.type === 'private' ? 'Chuyển sang Public' : 'Chuyển sang Private'}
          primaryTypographyProps={{ variant: 'body2' }}
        />
      </MenuItem>

      <MenuItem onClick={() => onCopyBoardLink(menuBoard)}>
        <ListItemIcon><LinkRoundedIcon fontSize='small' /></ListItemIcon>
        <ListItemText primary='Sao chép liên kết Bảng' primaryTypographyProps={{ variant: 'body2' }} />
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        onClick={() => {
          const target = menuBoard
          onClose()
          if (target) onDeleteBoard(target)
        }}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon><DeleteOutlineRoundedIcon fontSize='small' color='error' /></ListItemIcon>
        <ListItemText primary='Xóa Bảng Sprint này' primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
      </MenuItem>
    </Menu>
  )
}

export default BoardCardContextMenu
