import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Navigation = () => {
  return (
    <div>
      <Button color="inherit" component={Link} to="/notices">
        공지사항
      </Button>
      <Button color="inherit" component={Link} to="/contests">
        공모전
      </Button>
    </div>
  );
};

export default Navigation; 