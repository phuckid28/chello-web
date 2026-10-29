import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded'
import GridOnRoundedIcon from '@mui/icons-material/GridOnRounded'
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import { useTranslation } from '~/customHooks/useTranslation'

// Groups import / export / report actions so the toolbar stays compact (Jira "•••" pattern)
function ToolsMenu({ anchorEl, onClose, onImport, onExportExcel, onExportCsv, onReport, onOpenHub }) {
  const { tPrimary } = useTranslation()

  const items = [
    { key: 'hub', label: tPrimary('knowledgeHubBtn'), Icon: MenuBookRoundedIcon, color: '#a78bfa', action: onOpenHub },
    { key: 'report', label: tPrimary('sprintReportBtn'), Icon: SummarizeRoundedIcon, color: '#f472b6', action: onReport, dividerAfter: true },
    { key: 'import', label: tPrimary('importMdCsvBtn'), Icon: UploadFileRoundedIcon, color: '#38bdf8', action: onImport },
    { key: 'excel', label: tPrimary('exportExcelBtn'), Icon: TableViewRoundedIcon, color: '#10b981', action: onExportExcel },
    { key: 'csv', label: tPrimary('exportCsvBtn'), Icon: GridOnRoundedIcon, color: '#14b8a6', action: onExportCsv }
  ]

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{ sx: { borderRadius: '12px', minWidth: 240, mt: 0.5 } }}
    >
      {items.flatMap(({ key, label, Icon, color, action, dividerAfter }) => {
        const entry = (
          <MenuItem
            key={key}
            onClick={() => {
              onClose()
              action()
            }}
            sx={{ py: 1, '&:hover .MuiListItemIcon-root': { transform: 'scale(1.15)' } }}
          >
            <ListItemIcon sx={{ color, transition: 'transform 0.18s ease' }}><Icon fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}>{label}</ListItemText>
          </MenuItem>
        )
        return dividerAfter ? [entry, <Divider key={`${key}-divider`} />] : [entry]
      })}
    </Menu>
  )
}

export default ToolsMenu
