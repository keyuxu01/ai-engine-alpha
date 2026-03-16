import { useState } from 'react';
import { User } from 'lucide-react';
import type { UserData } from '@/types';
import { Card, CardContent } from '@ui/card';
import { Badge } from '@ui/badge';

interface UserListProps {
  initialData?: { users?: UserData[] };
}

function UserList({ initialData }: UserListProps) {
  const [users, setUsers] = useState<UserData[]>(initialData?.users || []);

  return (
    <div className="p-4 min-h-[200px] bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <User className="w-5 h-5" />
        <h2 className="text-lg font-semibold">用户列表</h2>
        <Badge variant="secondary">{users.length}</Badge>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>暂无用户数据</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                    <span className="text-xs text-gray-500">{user.age} 岁</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;
