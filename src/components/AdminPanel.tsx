
import React, { useState } from 'react';
import { Livestream } from '@/types/livestream';
import { formatTimestamp } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

interface AdminPanelProps {
  streams: Livestream[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSetHero: (id: string) => void;
  onPin: (id: string) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  streams, 
  onApprove, 
  onReject, 
  onSetHero, 
  onPin,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  
  const pendingStreams = streams.filter(s => !s.isApproved);
  const approvedStreams = streams.filter(s => s.isApproved);
  
  const displayStreams = activeTab === 'pending' ? pendingStreams : approvedStreams;

  return (
    <div className="border border-black p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-mono uppercase">ADMIN PANEL</h2>
        <Button onClick={onLogout} variant="outline" className="font-mono text-xs">LOGOUT</Button>
      </div>
      
      <div className="flex mb-4 border-b border-black">
        <button
          className={`py-2 px-4 font-mono ${activeTab === 'pending' ? 'bg-black text-white' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          PENDING ({pendingStreams.length})
        </button>
        <button
          className={`py-2 px-4 font-mono ${activeTab === 'approved' ? 'bg-black text-white' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          APPROVED ({approvedStreams.length})
        </button>
      </div>
      
      {displayStreams.length === 0 ? (
        <p className="text-center font-mono py-4">No {activeTab} streams to display</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">TITLE</TableHead>
                <TableHead className="font-mono">USER</TableHead>
                <TableHead className="font-mono">SUBMITTED</TableHead>
                <TableHead className="font-mono">PLATFORM</TableHead>
                <TableHead className="font-mono">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStreams.map((stream) => (
                <TableRow key={stream.id}>
                  <TableCell className="font-mono">{stream.title}</TableCell>
                  <TableCell className="font-mono text-xs">{stream.userEmail || 'Unknown'}</TableCell>
                  <TableCell className="font-mono text-xs">{formatTimestamp(stream.timestamp)}</TableCell>
                  <TableCell className="font-mono text-xs uppercase">{stream.platform || 'Custom'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {!stream.isApproved && (
                        <>
                          <Button 
                            onClick={() => onApprove(stream.id)} 
                            className="bg-black text-white font-mono text-xs px-2 py-1 h-auto"
                          >
                            APPROVE
                          </Button>
                          <Button 
                            onClick={() => onReject(stream.id)} 
                            className="bg-white text-black border border-black font-mono text-xs px-2 py-1 h-auto"
                          >
                            REJECT
                          </Button>
                        </>
                      )}
                      
                      {stream.isApproved && (
                        <>
                          <Button 
                            onClick={() => onSetHero(stream.id)} 
                            className={`${stream.isHero ? 'bg-black text-white' : 'bg-white text-black border border-black'} font-mono text-xs px-2 py-1 h-auto`}
                          >
                            {stream.isHero ? 'HERO ★' : 'SET HERO'}
                          </Button>
                          <Button 
                            onClick={() => onPin(stream.id)} 
                            className={`${stream.isPinned ? 'bg-black text-white' : 'bg-white text-black border border-black'} font-mono text-xs px-2 py-1 h-auto`}
                          >
                            {stream.isPinned ? 'PINNED ★' : 'PIN'}
                          </Button>
                          <Button 
                            onClick={() => onReject(stream.id)} 
                            className="bg-red-600 text-white font-mono text-xs px-2 py-1 h-auto hover:bg-red-700"
                          >
                            REMOVE
                          </Button>
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button className="bg-white text-black border border-black font-mono text-xs px-2 py-1 h-auto">
                                PREVIEW
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent className="p-6 max-w-3xl mx-auto">
                              <div className="mt-4">
                                <h3 className="font-mono font-bold text-lg mb-2">{stream.title}</h3>
                                <div className="h-64 bg-gray-100 flex items-center justify-center mb-2 border border-black">
                                  {stream.html ? (
                                    <div 
                                      className="w-full h-full"
                                      dangerouslySetInnerHTML={{ __html: stream.html }}
                                    />
                                  ) : (
                                    <span className="font-mono">[ NO PREVIEW AVAILABLE ]</span>
                                  )}
                                </div>
                                <p className="font-mono text-xs mb-4">
                                  {formatTimestamp(stream.timestamp)}
                                </p>
                                <div className="flex gap-2 justify-end">
                                  <Button 
                                    onClick={() => onReject(stream.id)} 
                                    className="bg-red-600 text-white border border-red-600 font-mono hover:bg-red-700"
                                  >
                                    REMOVE
                                  </Button>
                                </div>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
