import Navbar from "./Navbar"
import { NavbarContainerStyled } from "./Navbar.styles"

const sample = [
  {
    id: 'home',
    icon: 'home'
  },
  {
    id: 'list',
    icon: 'receipt_long'
  },
  {
    id: 'diary',
    icon: 'draw'
  }
]

const NavbarContainer = () => {
  return (
    <NavbarContainerStyled>
      <Navbar data={sample} />
    </NavbarContainerStyled>
  )
}

export default NavbarContainer