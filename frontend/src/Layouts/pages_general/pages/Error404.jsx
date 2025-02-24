import { Container, Title, Text, Button, Group } from '@mantine/core';
import { Illustration } from '../../../assets/Illustration';
import classes from '../styles/NothingFoundBackground.module.css';
import { Link } from 'react-router-dom';

export default function NothingFoundBackground() {
  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <Illustration className={classes.image} />
        <div className={classes.content}>
          <Title className={classes.title}>Rien à voir ici</Title>
          <Text c="dimmed" size="lg" ta="center" className={classes.title} mt={10} mb={10}>
            La page que vous essayez d'ouvrir n'existe pas. Vous avez peut-être mal saisi l'adresse, 
            ou la page a été déplacée vers une autre URL. Si vous pensez qu'il s'agit d'une erreur, contactez le support.
          </Text>
          <Group justify="center">
            <Link to={'/'}>
              <Button variant="light" size="md">Retourner à la page d'accueil</Button>
            </Link>
          </Group>
        </div>
      </div>
    </Container>
  );
}
