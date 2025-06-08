import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Guidelines = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#1A1A1A' }}>
          건의사항 작성 시 주의사항
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <ErrorOutlineIcon color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="개인정보 보호"
              secondary="다른 학생이나 교직원을 사칭하지 마세요. 사칭시 처벌 받을 수 있습니다."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <ErrorOutlineIcon color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="예의 바른 표현"
              secondary="불필요한 비난이나 공격적인 표현은 삼가해주세요. 건설적인 제안을 해주세요."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <InfoOutlinedIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="구체적인 내용"
              secondary="문제점과 개선방안을 구체적으로 설명해주세요. 막연한 불만보다는 실현 가능한 제안이 도움이 됩니다."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <InfoOutlinedIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="사실 확인"
              secondary="제안하시는 내용이 정확한 사실에 기반하고 있는지 확인해주세요."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <InfoOutlinedIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="신중한 작성"
              secondary="작성하신 건의사항은 수정이 어려우니, 신중하게 작성해주세요."
            />
          </ListItem>
        </List>

        <Typography variant="body2" sx={{ mt: 3, color: '#666', fontStyle: 'italic' }}>
          위 가이드라인을 지켜주시면 더 나은 학교를 만드는데 큰 도움이 됩니다.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Guidelines;
