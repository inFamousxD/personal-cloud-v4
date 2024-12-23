import NavbarContainer from '../../../common/navbar/NavbarContainer'
import DashboardContainer from '../../dashboard/DashboardContainer'
import { LayoutStyledNavbar } from './Layout.styles'

const DashboardLayout = () => {
  return (
    <LayoutStyledNavbar>
      <NavbarContainer />
      <DashboardContainer />
    </LayoutStyledNavbar>
  )
}

export default DashboardLayout