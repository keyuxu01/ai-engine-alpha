import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import type { UserData } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card';
import { Badge } from '@ui/badge';

interface UserDetailProps {
  initialData?: { user?: UserData };
}

function UserDetail({ initialData }: UserDetailProps) {
  const [user] = useState<UserData | undefined>(initialData?.user);

  if (!user) {
    return (
      <div className="p-4 min-h-[200px] bg-gray-50 dark:bg-gray-950">
        <div className="text-center py-10 text-gray-500">暂无用户详情</div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-[200px] bg-gray-50 dark:bg-gray-950">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <Badge className="w-fit mx-auto mt-2">{user.role}</Badge>
        </CardHeader>

        {user.detailInfo && (
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{user.age} 岁</span>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{user.detailInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{user.detailInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{user.detailInfo.address}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default UserDetail;
